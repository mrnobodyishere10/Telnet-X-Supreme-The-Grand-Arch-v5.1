import net from "node:net";

export function createTelnetClient(host, port) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(port, host, () => resolve(client));
    client.once("error", reject);
  });
}
