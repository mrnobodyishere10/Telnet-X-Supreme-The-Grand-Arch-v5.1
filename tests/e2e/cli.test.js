import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("CLI", () => {
  it("prints usage for --help", () => {
    const output = execSync("node src/cli.js --help").toString();
    expect(output).toMatch(/Usage/);
    expect(output).toMatch(/--json/);
    expect(output).toMatch(/BATCH/);
    expect(output).toMatch(/--out-format/);
    expect(output).toMatch(/--summary-only/);
  });

  it("fails unsupported command", () => {
    try {
      execSync("node src/cli.js PING localhost 23", { stdio: "pipe" });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toMatch(/Unsupported command/);
      return;
    }

    throw new Error("Expected command to fail");
  });

  it("fails malformed input", () => {
    try {
      execSync("node src/cli.js CONNECT localhost", { stdio: "pipe" });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toMatch(/Command format must be/);
      return;
    }

    throw new Error("Expected command to fail");
  });

  it("fails invalid timeout option", () => {
    try {
      execSync("node src/cli.js CONNECT localhost 23 --timeout 0", {
        stdio: "pipe",
      });
    } catch (error) {
      const stderr = error.stderr.toString();
      expect(stderr).toMatch(/--timeout must be a positive integer/);
      return;
    }

    throw new Error("Expected command to fail");
  });

  it("returns structured json error when --json is used", () => {
    try {
      execSync("node src/cli.js CONNECT bad host 23 --json", { stdio: "pipe" });
    } catch (error) {
      const stdout = error.stdout.toString().trim();
      const payload = JSON.parse(stdout);
      expect(payload.status).toBe("error");
      expect(payload.stage).toBe("parse");
      expect(payload.error).toMatch(/Command format must be/);
      return;
    }

    throw new Error("Expected command to fail");
  });

  it("returns structured json validation error for malformed batch file", () => {
    const tempFile = path.join(
      os.tmpdir(),
      `telnet-x-targets-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`,
    );
    const outFile = path.join(
      os.tmpdir(),
      `telnet-x-output-${Date.now()}-${Math.random().toString(16).slice(2)}.json`,
    );
    fs.writeFileSync(tempFile, "127.0.0.1\n");

    try {
      execSync(`node src/cli.js BATCH "${tempFile}" --json --out "${outFile}"`, {
        stdio: "pipe",
      });
    } catch (error) {
      const stdout = error.stdout.toString().trim();
      const payload = JSON.parse(stdout);
      expect(payload.status).toBe("error");
      expect(payload.command).toBe("BATCH");
      expect(payload.stage).toBe("validate");
      expect(payload.errorCode).toBe("INVALID_INPUT");
      expect(payload.error).toMatch(/Invalid target format/);

      const outPayload = JSON.parse(fs.readFileSync(outFile, "utf8"));
      expect(outPayload.command).toBe("BATCH");
      expect(outPayload.errorCode).toBe("INVALID_INPUT");

      fs.unlinkSync(tempFile);
      fs.unlinkSync(outFile);
      return;
    }

    fs.unlinkSync(tempFile);
    fs.unlinkSync(outFile);
    throw new Error("Expected command to fail");
  });
});
