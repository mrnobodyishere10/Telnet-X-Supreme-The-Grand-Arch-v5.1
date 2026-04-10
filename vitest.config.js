import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
      exclude: [
        "node_modules/**",
        "bedrock-claude/**",
        "tests/**",
        "vitest.config.js",
      ],
    },
  },
});
