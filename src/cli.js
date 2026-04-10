#!/usr/bin/env node
import { parseCommand } from "./utils/parser.js";
import { validateHost, validatePort } from "./utils/validation.js";
import { createTelnetClient } from "./services/telnetClient.js";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  console.log("Usage: telnet-x CONNECT <host> <port>");
  process.exit(0);
}

const { command, host, port } = parseCommand(args.join(" "));

if (command !== "CONNECT") {
  console.error("Unsupported command.");
  process.exit(1);
}

if (!validateHost(host) || !validatePort(port)) {
  console.error("Invalid host or port.");
  process.exit(1);
}

console.log(`Connecting to ${host}:${port}...`);

createTelnetClient(host, port)
  .then((client) => {
    console.log("Connected successfully.");
    client.end();
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
