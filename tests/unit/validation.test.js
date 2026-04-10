import test from "node:test";
import assert from "node:assert/strict";
import { validateHost, validatePort } from "../../src/utils/validation.js";

test("validation host + port", () => {
  assert.equal(validateHost("127.0.0.1"), true);
  assert.equal(validateHost("localhost"), true);
  assert.equal(validatePort(23), true);
});
