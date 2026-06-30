import { describe, it, expect } from "vitest";
import { acppSchema } from "../src/schemas";

describe("ACPP Protocol Schema", () => {
  it("should validate a completely valid and full payload", () => {
    const payload = {
      protocol: "ACPP",
      version: "1.0",
      client: {
        title: "My Client",
        subtitle: "A chat client",
        avatarUrl: "https://example.com/avatar.png",
        logoUrl: "https://example.com/logo.png",
      },
      window: {
        mode: "popup",
        width: 400,
        height: 600,
        minWidth: 300,
        minHeight: 500,
        resizable: true,
      },
      theme: {
        mode: "dark",
        primaryColor: "#000000",
        secondaryColor: "#333333",
        backgroundColor: "#111111",
        textColor: "#ffffff",
      },
      behavior: {
        autoOpen: true,
        showWelcome: true,
        typingIndicator: true,
        persistSession: true,
      },
      capabilities: {
        text: true,
        file: true,
        image: true,
        audio: false,
        video: false,
      },
      session: {
        timeoutSeconds: 3600,
        keepAlive: true,
      },
    };

    const result = acppSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should validate a payload with only required fields", () => {
    const payload = {
      protocol: "ACPP",
      version: "1.0",
      client: {
        title: "Minimal Client",
      },
      window: {
        mode: "embedded",
      },
      theme: {
        mode: "light",
        primaryColor: "#ff0000",
      },
      behavior: {},
      capabilities: {
        text: true,
        file: false,
      },
      session: {
        timeoutSeconds: 1800,
      },
    };

    const result = acppSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid protocol literal", () => {
    const payload = {
      protocol: "INVALID",
      version: "1.0",
      client: { title: "Client" },
      window: { mode: "embedded" },
      theme: { mode: "light", primaryColor: "#000" },
      behavior: {},
      capabilities: { text: true, file: false },
      session: { timeoutSeconds: 300 },
    };

    const result = acppSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should fail on missing required fields (e.g. client.title)", () => {
    const payload = {
      protocol: "ACPP",
      version: "1.0",
      client: {}, // title is missing
      window: { mode: "embedded" },
      theme: { mode: "light", primaryColor: "#000" },
      behavior: {},
      capabilities: { text: true, file: false },
      session: { timeoutSeconds: 300 },
    };

    const result = acppSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should fail on wrong types (e.g. timeoutSeconds as string)", () => {
    const payload = {
      protocol: "ACPP",
      version: "1.0",
      client: { title: "Client" },
      window: { mode: "embedded" },
      theme: { mode: "light", primaryColor: "#000" },
      behavior: {},
      capabilities: { text: true, file: false },
      session: { timeoutSeconds: "300" },
    };

    const result = acppSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
