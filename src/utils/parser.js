export function parseCommand(input) {
  const [command, host, port] = input.trim().split(/\s+/);
  return { command, host, port: Number(port) };
}
