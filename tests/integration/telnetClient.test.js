import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { createTelnetClient } from "../../src/services/telnetClient.js";

test("integration connect", async (t) => {
  const server = net.createServer((s) => {
    s.write("ok");
    s.end();
  });

  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();

  t.after(() => server.close());

  const client = await createTelnetClient("127.0.0.1", port);
  assert.ok(client);

  await new Promise((r) => client.end(r));
});
