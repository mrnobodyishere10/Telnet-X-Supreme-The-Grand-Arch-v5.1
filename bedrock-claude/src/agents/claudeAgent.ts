import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

export const createClaudeAgent = () => {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  return {
    async chat(message: string): Promise<string> {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      const first = response.content[0];
      return first.type === "text" ? first.text : "";
    },
  };
};
