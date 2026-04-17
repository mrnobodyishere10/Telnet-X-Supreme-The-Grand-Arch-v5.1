export function parseCommand(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("Command input must be a non-empty string.");
  }

  const parts = input.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error("Command format must be: CONNECT <host> <port>");
  }

  const [rawCommand, host, rawPort] = parts;

  return {
    command: rawCommand.toUpperCase(),
    host,
    port: Number(rawPort),
  };
}

export function parseBatchCommand(input) {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new Error("Batch command input must be a non-empty string.");
  }

  const parts = input.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error("Command format must be: BATCH <targets-file>");
  }

  const [rawCommand, targetsFile] = parts;

  return {
    command: rawCommand.toUpperCase(),
    targetsFile,
  };
}

function parsePositiveIntegerFlag(flagName, value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }
  return parsed;
}

function parseNonNegativeIntegerFlag(flagName, value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${flagName} must be a non-negative integer.`);
  }
  return parsed;
}

export function parseCliArgs(argv) {
  if (!Array.isArray(argv)) {
    throw new Error("CLI arguments must be an array.");
  }

  const positional = [];
  let timeoutMs;
  let retries;
  let concurrency;
  let outFile;
  let outFormat = "json";
  let append = false;
  let summaryOnly = false;
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--timeout") {
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error("--timeout requires a value.");
      }
      timeoutMs = parsePositiveIntegerFlag("--timeout", next);
      index += 1;
      continue;
    }

    if (token === "--retries") {
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error("--retries requires a value.");
      }
      retries = parseNonNegativeIntegerFlag("--retries", next);
      index += 1;
      continue;
    }

    if (token === "--json") {
      json = true;
      continue;
    }

    if (token === "--concurrency") {
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error("--concurrency requires a value.");
      }
      concurrency = parsePositiveIntegerFlag("--concurrency", next);
      index += 1;
      continue;
    }

    if (token === "--out") {
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error("--out requires a file path.");
      }
      if (typeof next === "string" && next.startsWith("--")) {
        throw new Error("--out requires a valid file path.");
      }
      outFile = next;
      index += 1;
      continue;
    }

    if (token === "--out-format") {
      const next = argv[index + 1];
      if (next === undefined) {
        throw new Error("--out-format requires a value.");
      }
      if (next !== "json" && next !== "ndjson") {
        throw new Error("--out-format must be either json or ndjson.");
      }
      outFormat = next;
      index += 1;
      continue;
    }

    if (token === "--append") {
      append = true;
      continue;
    }

    if (token === "--summary-only") {
      summaryOnly = true;
      continue;
    }

    if (typeof token === "string" && token.startsWith("--")) {
      throw new Error(`Unsupported option: ${token}`);
    }

    positional.push(token);
  }

  if (positional.length === 0) {
    throw new Error("Missing command.");
  }

  const rawCommand = positional[0].toUpperCase();
  let parsed;
  if (rawCommand === "CONNECT") {
    parsed = parseCommand(positional.join(" "));
  } else if (rawCommand === "BATCH") {
    parsed = parseBatchCommand(positional.join(" "));
  } else {
    throw new Error("Unsupported command.");
  }

  return {
    ...parsed,
    timeoutMs,
    retries,
    concurrency,
    outFile,
    outFormat,
    append,
    summaryOnly,
    json,
  };
}
