import { describe, expect, it } from "vitest";
import { validateHost, validatePort } from "../../src/utils/validation.js";

describe("validation", () => {
  it("accepts valid hosts", () => {
    expect(validateHost("127.0.0.1")).toBe(true);
    expect(validateHost("::1")).toBe(true);
    expect(validateHost("localhost")).toBe(true);
    expect(validateHost("example.com")).toBe(true);
  });

  it("rejects invalid hosts", () => {
    expect(validateHost("")).toBe(false);
    expect(validateHost("-bad.example.com")).toBe(false);
    expect(validateHost("host name")).toBe(false);
    expect(validateHost("999.999.999.999")).toBe(false);
  });

  it("validates ports", () => {
    expect(validatePort(23)).toBe(true);
    expect(validatePort(65535)).toBe(true);
    expect(validatePort(0)).toBe(false);
    expect(validatePort(70000)).toBe(false);
    expect(validatePort(22.5)).toBe(false);
  });
});
