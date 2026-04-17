import { describe, expect, it } from "vitest";
import {
  parseBatchCommand,
  parseCliArgs,
  parseCommand,
} from "../../src/utils/parser.js";

describe("parseCommand", () => {
  it("parses a valid command", () => {
    const result = parseCommand("CONNECT 127.0.0.1 23");
    expect(result).toEqual({
      command: "CONNECT",
      host: "127.0.0.1",
      port: 23,
    });
  });

  it("normalizes lowercase command", () => {
    const result = parseCommand("connect localhost 2323");
    expect(result.command).toBe("CONNECT");
  });

  it("throws on empty input", () => {
    expect(() => parseCommand(" ")).toThrow(
      "Command input must be a non-empty string.",
    );
  });

  it("throws on wrong argument count", () => {
    expect(() => parseCommand("CONNECT localhost")).toThrow(
      "Command format must be: CONNECT <host> <port>",
    );
  });
});

describe("parseCliArgs", () => {
  it("parses positional command with options", () => {
    const result = parseCliArgs([
      "CONNECT",
      "127.0.0.1",
      "23",
      "--timeout",
      "1500",
      "--retries",
      "2",
      "--out",
      "connect-result.json",
      "--json",
    ]);

    expect(result).toEqual({
      command: "CONNECT",
      host: "127.0.0.1",
      port: 23,
      timeoutMs: 1500,
      retries: 2,
      outFile: "connect-result.json",
      outFormat: "json",
      append: false,
      summaryOnly: false,
      json: true,
    });
  });

  it("throws for unsupported option", () => {
    expect(() => parseCliArgs(["CONNECT", "localhost", "23", "--unknown"])).toThrow(
      "Unsupported option: --unknown",
    );
  });

  it("throws for invalid timeout", () => {
    expect(() =>
      parseCliArgs(["CONNECT", "localhost", "23", "--timeout", "0"]),
    ).toThrow("--timeout must be a positive integer.");
  });

  it("parses batch mode with concurrency", () => {
    const result = parseCliArgs([
      "BATCH",
      "targets.txt",
      "--concurrency",
      "10",
      "--out",
      "batch-result.json",
      "--json",
    ]);

    expect(result).toEqual({
      command: "BATCH",
      targetsFile: "targets.txt",
      timeoutMs: undefined,
      retries: undefined,
      concurrency: 10,
      outFile: "batch-result.json",
      outFormat: "json",
      append: false,
      summaryOnly: false,
      json: true,
    });
  });

  it("throws when --out has no value", () => {
    expect(() => parseCliArgs(["BATCH", "targets.txt", "--out"])).toThrow(
      "--out requires a file path.",
    );
  });

  it("parses append + ndjson + summary-only options", () => {
    const result = parseCliArgs([
      "BATCH",
      "targets.txt",
      "--out",
      "run.ndjson",
      "--out-format",
      "ndjson",
      "--append",
      "--summary-only",
    ]);

    expect(result.outFormat).toBe("ndjson");
    expect(result.append).toBe(true);
    expect(result.summaryOnly).toBe(true);
  });

  it("throws for invalid out format", () => {
    expect(() =>
      parseCliArgs(["BATCH", "targets.txt", "--out-format", "yaml"]),
    ).toThrow("--out-format must be either json or ndjson.");
  });
});

describe("parseBatchCommand", () => {
  it("parses a valid batch command", () => {
    expect(parseBatchCommand("BATCH targets.txt")).toEqual({
      command: "BATCH",
      targetsFile: "targets.txt",
    });
  });

  it("throws for malformed batch command", () => {
    expect(() => parseBatchCommand("BATCH")).toThrow(
      "Command format must be: BATCH <targets-file>",
    );
  });
});
