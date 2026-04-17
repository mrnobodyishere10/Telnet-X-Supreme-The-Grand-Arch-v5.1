import net from "node:net";

const DEFAULT_CONNECT_TIMEOUT_MS = 5000;
const DEFAULT_RETRIES = 0;
const DEFAULT_BACKOFF_MS = 250;

export function createTelnetClient(host, port, options = {}) {
  const timeoutMs =
    Number.isInteger(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_CONNECT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let settled = false;
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      client.removeListener("connect", onConnect);
      client.removeListener("error", onError);
    };

    const settle = (handler, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      handler(value);
    };

    const onConnect = () => settle(resolve, client);
    const onError = (error) => {
      if (!client.destroyed) {
        client.destroy();
      }
      settle(reject, error);
    };

    timeoutId = setTimeout(() => {
      onError(
        new Error(
          `Connection timeout after ${timeoutMs}ms while connecting to ${host}:${port}`,
        ),
      );
    }, timeoutMs);

    client.once("connect", onConnect);
    client.once("error", onError);
    client.connect(port, host);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectWithRetry(
  host,
  port,
  options = {},
  connectFn = createTelnetClient,
) {
  const timeoutMs =
    Number.isInteger(options.timeoutMs) && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_CONNECT_TIMEOUT_MS;
  const retries =
    Number.isInteger(options.retries) && options.retries >= 0
      ? options.retries
      : DEFAULT_RETRIES;
  const backoffMs =
    Number.isInteger(options.backoffMs) && options.backoffMs > 0
      ? options.backoffMs
      : DEFAULT_BACKOFF_MS;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await connectFn(host, port, { timeoutMs });
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const delayMs = backoffMs * 2 ** attempt;
      await wait(delayMs);
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Connection failed after ${retries + 1} attempt(s): ${reason}`,
  );
}
