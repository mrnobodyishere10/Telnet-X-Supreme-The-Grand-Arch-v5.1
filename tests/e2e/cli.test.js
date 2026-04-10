import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";

test("CLI help", () => {
  const out = execSync("node src/cli.js --help").toString();
  assert.match(out, /Usage/);
});
