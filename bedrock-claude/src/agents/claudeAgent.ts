import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_MODEL = "claude-3-5-sonnet-20240620";
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const MAX_MESSAGE_LENGTH = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Claude request timed out after ${timeoutMs}ms. Consider increasing timeout or checking network health.`,
        ),
      );
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer. Received: ${raw}`);
  }

  return parsed;
}

function isRetryableStatus(status: unknown): boolean {
  return status === 408 || status === 409 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isTransientError(error: unknown): boolean {
  const message = String((error as { message?: string })?.message ?? "").toLowerCase();
  const status = (error as { status?: unknown })?.status;
  return (
    isRetryableStatus(status) ||
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("temporarily") ||
    message.includes("overloaded") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("ecanceled")
  );
}

export const createClaudeAgent = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Set it in your environment before using createClaudeAgent.",
    );
  }

  const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  const timeoutMs = parsePositiveIntEnv("CLAUDE_REQUEST_TIMEOUT_MS", DEFAULT_REQUEST_TIMEOUT_MS);
  const maxAttempts = parsePositiveIntEnv("CLAUDE_MAX_ATTEMPTS", DEFAULT_MAX_ATTEMPTS);

  const client = new Anthropic({
    apiKey,
    // Let SDK enforce transport timeout so request is actually cancelled.
    timeout: timeoutMs,
    maxRetries: 0,
  });

  return {
    async chat(message: string): Promise<string> {
      if (!message || !message.trim()) {
        throw new Error("Message must be a non-empty string.");
      }
      if (message.length > MAX_MESSAGE_LENGTH) {
        throw new Error(`Message exceeds safe length limit (${MAX_MESSAGE_LENGTH} characters).`);
      }

      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await withTimeout(
            client.messages.create({
              model,
              max_tokens: DEFAULT_MAX_TOKENS,
              messages: [
                {
                  role: "user",
                  content: message,
                },
              ],
            }),
            timeoutMs,
          );

          const firstTextBlock = response.content.find((entry) => entry.type === "text");
          if (!firstTextBlock || !firstTextBlock.text) {
            throw new Error("Claude response did not include a text block.");
          }

          const cleanText = firstTextBlock.text.trim();
          if (!cleanText) {
            throw new Error("Claude response returned empty text.");
          }

          return cleanText;
        } catch (error) {
          lastError = error;

          if (!isTransientError(error) || attempt === maxAttempts) {
            break;
          }

          await sleep(250 * 2 ** (attempt - 1));
        }
      }

      const finalMessage = String(
        (lastError as { message?: string })?.message ?? "Unknown Claude request error.",
      );
      throw new Error(`Claude request failed after ${maxAttempts} attempt(s): ${finalMessage}`);
    },
  };
};
