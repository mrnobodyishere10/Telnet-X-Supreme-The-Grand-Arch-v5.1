import { spawnSync } from "node:child_process";

function runStep(command, args, cwd = process.cwd()) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: false,
  });
  return {
    command: `${command} ${args.join(" ")}`,
    cwd,
    ok: result.status === 0,
    exitCode: result.status,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout?.trim() || "",
    stderr: result.stderr?.trim() || "",
  };
}

const root = process.cwd();
const steps = [
  runStep("npm", ["run", "lint"], root),
  runStep("npm", ["test"], root),
  runStep("npm", ["run", "build"], `${root}/bedrock-claude`),
];

if (process.env.ANTHROPIC_API_KEY) {
  steps.push(
    runStep(
      "npm",
      ["run", "dev", "--", "--healthcheck", "--json"],
      `${root}/bedrock-claude`,
    ),
  );
} else {
  steps.push({
    command: "npm run dev -- --healthcheck --json",
    cwd: `${root}/bedrock-claude`,
    ok: true,
    skipped: true,
    exitCode: 0,
    durationMs: 0,
    stdout: "",
    stderr: "Skipped: ANTHROPIC_API_KEY is not set",
  });
}

const ok = steps.every((step) => step.ok);
const payload = {
  status: ok ? "ok" : "error",
  generatedAt: new Date().toISOString(),
  totalSteps: steps.length,
  passedSteps: steps.filter((step) => step.ok).length,
  failedSteps: steps.filter((step) => !step.ok).length,
  steps,
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
