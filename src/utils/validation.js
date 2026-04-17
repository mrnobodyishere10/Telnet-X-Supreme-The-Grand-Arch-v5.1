import net from "node:net";

export function validateHost(host) {
  if (typeof host !== "string" || host.length === 0 || host.length > 253) {
    return false;
  }

  if (host === "localhost") return true;
  if (net.isIP(host) !== 0) return true;

  // RFC-friendly FQDN check (labels 1-63 chars, no leading/trailing hyphen).
  const hostname =
    /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

  return hostname.test(host);
}

export function validatePort(port) {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}
