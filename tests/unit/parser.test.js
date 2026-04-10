import test from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "../../src/utils/parser.js";

test("parseCommand", () => {
  const r = parseCommand("CONNECT 127.0.0.1 23");
  assert.deepEqual(r, {
    command: "CONNECT",
    host: "127.0.0.1",
    port: 23,
  });
});
