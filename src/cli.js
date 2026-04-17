#!/usr/bin/env node
import fs from "node:fs/promises";
import { parseCliArgs } from "./utils/parser.js";
import { validateHost, validatePort } from "./utils/validation.js";
import { connectWithRetry } from "./services/telnetClient.js";

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRIES = 0;
const DEFAULT_CONCURRENCY = 5;

function resolveErrorCode(errorMessage) {
  const message = String(errorMessage || "").toLowerCase();
  if (message.includes("timeout")) return "TIMEOUT";
  if (message.includes("econnrefused")) return "CONNECTION_REFUSED";
  if (message.includes("enotfound") || message.includes("eai_again")) return "DNS_ERROR";
  if (message.includes("unsupported")) return "UNSUPPORTED_COMMAND";
  if (message.includes("invalid")) return "INVALID_INPUT";
  if (message.includes("unable to read")) return "IO_ERROR";
  return "UNKNOWN_ERROR";
}

async function writeOutputFileAdvanced(outFile, payload, options = {}) {
  if (!outFile) return;
  const outFormat = options.outFormat === "ndjson" ? "ndjson" : "json";
  const append = Boolean(options.append);

  if (outFormat === "ndjson") {
    const line = `${JSON.stringify(payload)}\n`;
    if (append) {
      await fs.appendFile(outFile, line, "utf8");
      return;
    }
    await fs.writeFile(outFile, line, "utf8");
    return;
  }

  const jsonText = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(outFile, jsonText, "utf8");
}

function writeJson(payload, exitCode) {
  console.log(JSON.stringify(payload));
  process.exit(exitCode);
}

function printHelp() {
  console.log(
    "Usage: telnet-x CONNECT <host> <port> [--timeout <ms>] [--retries <count>] [--json] [--out <file>] [--out-format <json|ndjson>] [--append]",
  );
  console.log(
    "   or: telnet-x BATCH <targets-file> [--timeout <ms>] [--retries <count>] [--concurrency <n>] [--json] [--out <file>] [--out-format <json|ndjson>] [--append] [--summary-only]",
  );
}

function parseTargetsFile(text) {
  const rows = text
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line && !line.startsWith("#"));

  return rows.map(({ line, lineNumber }) => {
    const [host, rawPort, ...rest] = line.split(/\s+/);
    if (!host || !rawPort || rest.length > 0) {
      throw new Error(
        `Invalid target format at line ${lineNumber}. Expected: <host> <port>`,
      );
    }

    const port = Number(rawPort);
    if (!validateHost(host) || !validatePort(port)) {
      throw new Error(`Invalid host or port at line ${lineNumber}: ${line}`);
    }

    return { host, port, lineNumber };
  });
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;

  async function workerLoop() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    () => workerLoop(),
  );
  await Promise.all(runners);
  return results;
}

async function run() {
  const args = process.argv.slice(2);
  const wantsJson = args.includes("--json");

  if (args.length === 0 || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  let parsedCommand;
  try {
    parsedCommand = parseCliArgs(args);
  } catch (error) {
    if (wantsJson) {
      writeJson(
        {
          status: "error",
          stage: "parse",
          error: error.message,
        },
        1,
      );
    }
    console.error(error.message);
    process.exit(1);
  }

  const { command, json } = parsedCommand;
  const retryCount = parsedCommand.retries ?? DEFAULT_RETRIES;
  const timeoutLabel = parsedCommand.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { outFile, outFormat, append, summaryOnly } = parsedCommand;

  if (command === "CONNECT") {
    const { host, port } = parsedCommand;
    if (!validateHost(host) || !validatePort(port)) {
      if (json) {
        const payload = {
          status: "error",
          stage: "validate",
          error: "Invalid host or port.",
          errorCode: "INVALID_INPUT",
        };
        await writeOutputFileAdvanced(outFile, payload, { outFormat, append });
        writeJson(payload, 1);
      }
      console.error("Invalid host or port.");
      process.exit(1);
    }

    const startedAt = Date.now();
    if (!json) {
      console.log(
        `Connecting to ${host}:${port} (timeout=${timeoutLabel}ms, retries=${retryCount})...`,
      );
    }

    try {
      const client = await connectWithRetry(host, port, {
        timeoutMs: timeoutLabel,
        retries: retryCount,
      });
      const latencyMs = Date.now() - startedAt;
      client.end();

      if (json) {
        const payload = {
          status: "ok",
          command: "CONNECT",
          host,
          port,
          timeoutMs: timeoutLabel,
          retries: retryCount,
          latencyMs,
        };
        await writeOutputFileAdvanced(outFile, payload, { outFormat, append });
        writeJson(payload, 0);
      }

      await writeOutputFileAdvanced(
        outFile,
        {
        status: "ok",
        command: "CONNECT",
        host,
        port,
        timeoutMs: timeoutLabel,
        retries: retryCount,
        latencyMs,
        },
        { outFormat, append },
      );
      console.log("Connected successfully.");
      process.exit(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const payload = {
        status: "error",
        stage: "connect",
        command: "CONNECT",
        host,
        port,
        timeoutMs: timeoutLabel,
        retries: retryCount,
        error: errorMessage,
        errorCode: resolveErrorCode(errorMessage),
        latencyMs: Date.now() - startedAt,
      };
      await writeOutputFileAdvanced(outFile, payload, { outFormat, append });
      if (json) {
        writeJson(payload, 1);
      }
      console.error("Connection failed:", errorMessage);
      process.exit(1);
    }
  }

  if (command === "BATCH") {
    const concurrency = parsedCommand.concurrency ?? DEFAULT_CONCURRENCY;
    const startedAt = Date.now();
    let fileText;
    try {
      fileText = await fs.readFile(parsedCommand.targetsFile, "utf8");
    } catch (error) {
      if (json) {
        const errorMessage = `Unable to read targets file: ${error.message}`;
        const payload = {
          status: "error",
          stage: "io",
          command: "BATCH",
          error: errorMessage,
          errorCode: "IO_ERROR",
        };
        await writeOutputFileAdvanced(outFile, payload, { outFormat, append });
        writeJson(payload, 1);
      }
      console.error(`Unable to read targets file: ${error.message}`);
      process.exit(1);
    }

    let targets;
    try {
      targets = parseTargetsFile(fileText);
    } catch (error) {
      if (json) {
        const payload = {
          status: "error",
          stage: "validate",
          command: "BATCH",
          error: error.message,
          errorCode: "INVALID_INPUT",
        };
        await writeOutputFileAdvanced(outFile, payload, { outFormat, append });
        writeJson(payload, 1);
      }
      console.error(error.message);
      process.exit(1);
    }

    if (!json) {
      console.log(
        `Running batch for ${targets.length} target(s) (timeout=${timeoutLabel}ms, retries=${retryCount}, concurrency=${concurrency})...`,
      );
    }

    const results = await runWithConcurrency(targets, concurrency, async (target) => {
      const targetStart = Date.now();
      try {
        const client = await connectWithRetry(target.host, target.port, {
          timeoutMs: timeoutLabel,
          retries: retryCount,
        });
        client.end();
        return {
          host: target.host,
          port: target.port,
          lineNumber: target.lineNumber,
          status: "ok",
          errorCode: null,
          latencyMs: Date.now() - targetStart,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          host: target.host,
          port: target.port,
          lineNumber: target.lineNumber,
          status: "error",
          error: errorMessage,
          errorCode: resolveErrorCode(errorMessage),
          latencyMs: Date.now() - targetStart,
        };
      }
    });

    const okCount = results.filter((result) => result.status === "ok").length;
    const errorCount = results.length - okCount;
    const payload = {
      status: errorCount === 0 ? "ok" : "error",
      command: "BATCH",
      timeoutMs: timeoutLabel,
      retries: retryCount,
      concurrency,
      total: results.length,
      ok: okCount,
      failed: errorCount,
      durationMs: Date.now() - startedAt,
      results,
    };
    const payloadToWrite = summaryOnly
      ? {
          status: payload.status,
          command: payload.command,
          timeoutMs: payload.timeoutMs,
          retries: payload.retries,
          concurrency: payload.concurrency,
          total: payload.total,
          ok: payload.ok,
          failed: payload.failed,
          durationMs: payload.durationMs,
        }
      : payload;
    await writeOutputFileAdvanced(outFile, payloadToWrite, { outFormat, append });

    if (json) {
      writeJson(payload, errorCount === 0 ? 0 : 1);
    }

    if (!summaryOnly) {
      for (const result of results) {
        if (result.status === "ok") {
          console.log(
            `[OK] ${result.host}:${result.port} (${result.latencyMs}ms)`,
          );
        } else {
          console.log(
            `[ERR] ${result.host}:${result.port} (${result.latencyMs}ms) - ${result.error}`,
          );
        }
      }
    }
    console.log(
      `Batch summary: total=${payload.total}, ok=${payload.ok}, failed=${payload.failed}`,
    );
    process.exit(errorCount === 0 ? 0 : 1);
  }

  if (json) {
    writeJson(
      { status: "error", stage: "validate", error: "Unsupported command." },
      1,
    );
  }
  console.error("Unsupported command.");
  process.exit(1);
}

run();
