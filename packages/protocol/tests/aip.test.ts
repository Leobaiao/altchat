import { describe, it, expect } from "vitest";
import { aiCommandSchema, clientEventSchema, altChatEventSchema } from "../src/schemas";

describe("AIP Protocol Schemas", () => {
  describe("AICommand", () => {
    it("should validate a valid show_message command", () => {
      const payload = {
        action: "show_message",
        text: "Hello, World!",
        rich: true,
      };

      const result = aiCommandSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should validate a valid show_form command", () => {
      const payload = {
        action: "show_form",
        text: "Please fill out this form",
        form: {
          name: "contact_form",
          submitLabel: "Send",
          fields: [
            {
              name: "email",
              label: "Email Address",
              type: "email",
              required: true,
            },
          ],
        },
      };

      const result = aiCommandSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail on unknown command action", () => {
      const payload = {
        action: "unknown_command",
        text: "I am invalid",
      };

      const result = aiCommandSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should fail when missing required fields for a command", () => {
      const payload = {
        action: "request_input",
        text: "Give me your input",
        // field is missing
      };

      const result = aiCommandSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("ClientEvent", () => {
    it("should validate a valid user.message event", () => {
      const payload = {
        type: "user.message",
        payload: {
          text: "Hi there!",
        },
      };

      const result = clientEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should validate a valid form.submitted event", () => {
      const payload = {
        type: "form.submitted",
        payload: {
          form: "contact_form",
          values: {
            email: "test@example.com",
            name: "John Doe",
          },
        },
      };

      const result = clientEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should fail on invalid event type", () => {
      const payload = {
        type: "invalid.event",
      };

      const result = clientEventSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("AltChatEvent", () => {
    it("should validate an AltChatEvent wrapper", () => {
      const payload = {
        sessionId: "session_123",
        tenantId: "tenant_456",
        type: "button.clicked",
        payload: {
          value: "btn_1",
        },
      };

      const result = altChatEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
