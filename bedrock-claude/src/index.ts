import { createClaudeAgent } from "./agents/claudeAgent";

async function main() {
  const agent = createClaudeAgent();
  const response = await agent.chat("Hello, Claude!");
  console.log("Claude says:", response);
}

main();
