import net from "node:net";
import { describe, expect, it } from "vitest";
import {
  connectWithRetry,
  createTelnetClient,
} from "../../src/services/telnetClient.js";

describe("createTelnetClient", () => {
  it("connects to an active local server", async () => {
    const server = net.createServer((socket) => {
      socket.write("ok");
      socket.end();
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    const client = await createTelnetClient("127.0.0.1", port);
    expect(client).toBeTruthy();

    await new Promise((resolve) => client.end(resolve));
    await new Promise((resolve) => server.close(resolve));
  });

  it("rejects with timeout on unreachable target", async () => {
    await expect(
      createTelnetClient("203.0.113.1", 65000, { timeoutMs: 50 }),
    ).rejects.toThrow(/timeout/i);
  });

  it("rejects quickly on invalid host", async () => {
    await expect(
      createTelnetClient("non existent host", 23, { timeoutMs: 100 }),
    ).rejects.toThrow();
  });
});

describe("connectWithRetry", () => {
  it("retries and eventually resolves", async () => {
    let attempts = 0;
    const connectFn = async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error("temporary failure");
      }
      return { end: () => {} };
    };

    const client = await connectWithRetry(
      "127.0.0.1",
      23,
      { retries: 2, backoffMs: 1, timeoutMs: 50 },
      connectFn,
    );

    expect(client).toBeTruthy();
    expect(attempts).toBe(3);
  });

  it("fails after exhausting retries", async () => {
    let attempts = 0;
    const connectFn = async () => {
      attempts += 1;
      throw new Error("still down");
    };

    await expect(
      connectWithRetry(
        "127.0.0.1",
        23,
        { retries: 2, backoffMs: 1, timeoutMs: 50 },
        connectFn,
      ),
    ).rejects.toThrow(/after 3 attempt\(s\)/i);
    expect(attempts).toBe(3);
  });
});
