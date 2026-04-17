import { createClaudeAgent } from "./agents/claudeAgent";

type HealthcheckPayload = {
  status: "ok" | "error";
  stage: "init" | "chat";
  latencyMs?: number;
  model?: string;
  error?: string;
};

function printJson(payload: HealthcheckPayload): void {
  console.log(JSON.stringify(payload));
}

async function runHealthcheck(json = false): Promise<void> {
  const startedAt = Date.now();

  let agent: ReturnType<typeof createClaudeAgent>;
  try {
    agent = createClaudeAgent();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const payload: HealthcheckPayload = {
      status: "error",
      stage: "init",
      error: message,
    };
    if (json) {
      printJson(payload);
    } else {
      console.error("Healthcheck failed at init:", message);
    }
    process.exit(1);
  }

  try {
    await agent.chat(
      "Healthcheck: respond with exactly OK and no additional words.",
    );
    const payload: HealthcheckPayload = {
      status: "ok",
      stage: "chat",
      latencyMs: Date.now() - startedAt,
      model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20240620",
    };
    if (json) {
      printJson(payload);
    } else {
      console.log(
        `Healthcheck OK (${payload.latencyMs}ms, model=${payload.model})`,
      );
    }
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const payload: HealthcheckPayload = {
      status: "error",
      stage: "chat",
      latencyMs: Date.now() - startedAt,
      error: message,
    };
    if (json) {
      printJson(payload);
    } else {
      console.error("Healthcheck failed at chat:", message);
    }
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const wantsJson = args.includes("--json");
  const wantsHealthcheck = args.includes("--healthcheck");

  if (wantsHealthcheck) {
    await runHealthcheck(wantsJson);
    return;
  }

  const prompt = args.join(" ").trim() || "Hello, Claude!";
  const agent = createClaudeAgent();
  const response = await agent.chat(prompt);
  console.log("Claude says:", response);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Claude agent failed:", message);
  process.exit(1);
});
