export function validateHost(host) {
  if (host === "localhost") return true;

  const ipv4 =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  return ipv4.test(host);
}

export function validatePort(port) {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}
