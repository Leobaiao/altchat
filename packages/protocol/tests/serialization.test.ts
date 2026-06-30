import { describe, it, expect } from "vitest";
import { acppSchema, aiCommandSchema } from "../src/schemas";

describe("Serialization and Deserialization", () => {
  it("should serialize and deserialize ACPP payloads correctly", () => {
    const originalPayload = {
      protocol: "ACPP",
      version: "1.0",
      client: {
        title: "Test Client",
      },
      window: {
        mode: "popup",
      },
      theme: {
        mode: "light",
        primaryColor: "#000",
      },
      behavior: {},
      capabilities: {
        text: true,
        file: false,
      },
      session: {
        timeoutSeconds: 300,
      },
    };

    // Serialize to JSON string
    const jsonString = JSON.stringify(originalPayload);
    
    // Deserialize from JSON string
    const parsedPayload = JSON.parse(jsonString);
    
    // Validate with Zod
    const result = acppSchema.safeParse(parsedPayload);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(originalPayload);
    }
  });

  it("should serialize and deserialize AICommand payloads correctly", () => {
    const originalPayload = {
      action: "show_message",
      text: "Hello!",
    };

    // Serialize to JSON string
    const jsonString = JSON.stringify(originalPayload);
    
    // Deserialize from JSON string
    const parsedPayload = JSON.parse(jsonString);
    
    // Validate with Zod
    const result = aiCommandSchema.safeParse(parsedPayload);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(originalPayload);
    }
  });
});
