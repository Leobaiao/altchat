import { z } from "zod";

// --- ACPP Schemas ---
export const acppSchema = z.object({
  protocol: z.literal("ACPP"),
  version: z.literal("1.0"),
  client: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    avatarUrl: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  window: z.object({
    mode: z.enum(["embedded", "popup", "fullscreen"]),
    width: z.number().optional(),
    height: z.number().optional(),
    minWidth: z.number().optional(),
    minHeight: z.number().optional(),
    resizable: z.boolean().optional(),
  }),
  theme: z.object({
    mode: z.enum(["light", "dark", "auto"]),
    primaryColor: z.string(),
    secondaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }),
  behavior: z.object({
    autoOpen: z.boolean().optional(),
    showWelcome: z.boolean().optional(),
    typingIndicator: z.boolean().optional(),
    persistSession: z.boolean().optional(),
  }),
  capabilities: z.object({
    text: z.boolean(),
    file: z.boolean(),
    image: z.boolean().optional(),
    audio: z.boolean().optional(),
    video: z.boolean().optional(),
  }),
  session: z.object({
    timeoutSeconds: z.number(),
    keepAlive: z.boolean().optional(),
  }),
});

// --- AIP Schemas ---
export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "email",
  "phone",
  "cpf",
  "cnpj",
  "number",
  "date",
  "datetime",
  "select",
  "radio",
  "checkbox",
  "file",
]);

export const inputFieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: fieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  mask: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const showMessageCommandSchema = z.object({
  action: z.literal("show_message"),
  text: z.string(),
  rich: z.boolean().optional(),
});

export const requestInputCommandSchema = z.object({
  action: z.literal("request_input"),
  text: z.string(),
  field: inputFieldSchema,
});

export const showButtonsCommandSchema = z.object({
  action: z.literal("show_buttons"),
  text: z.string(),
  buttons: z.array(z.object({ label: z.string(), value: z.string() })),
});

export const showFormCommandSchema = z.object({
  action: z.literal("show_form"),
  text: z.string(),
  form: z.object({
    name: z.string(),
    submitLabel: z.string().optional(),
    fields: z.array(inputFieldSchema),
  }),
});

export const uploadFileCommandSchema = z.object({
  action: z.literal("upload_file"),
  text: z.string(),
  accept: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  maxSizeBytes: z.number().optional(),
});

export const waitCommandSchema = z.object({
  action: z.literal("wait"),
  text: z.string().optional(),
});

export const redirectCommandSchema = z.object({
  action: z.literal("redirect"),
  url: z.string(),
});

export const clearCommandSchema = z.object({
  action: z.literal("clear"),
});

export const closeCommandSchema = z.object({
  action: z.literal("close"),
  text: z.string().optional(),
});

export const aiCommandSchema = z.discriminatedUnion("action", [
  showMessageCommandSchema,
  requestInputCommandSchema,
  showButtonsCommandSchema,
  showFormCommandSchema,
  uploadFileCommandSchema,
  waitCommandSchema,
  redirectCommandSchema,
  clearCommandSchema,
  closeCommandSchema,
]);

// --- Event Schemas ---

export const sessionStartedEventSchema = z.object({
  type: z.literal("session.started"),
  payload: z.any().optional(),
});

export const userMessageEventSchema = z.object({
  type: z.literal("user.message"),
  payload: z.object({ text: z.string() }),
});

export const userInputEventSchema = z.object({
  type: z.literal("user.input"),
  payload: z.object({ field: z.string(), value: z.any() }),
});

export const buttonClickedEventSchema = z.object({
  type: z.literal("button.clicked"),
  payload: z.object({ value: z.string() }),
});

export const optionSelectedEventSchema = z.object({
  type: z.literal("option.selected"),
  payload: z.object({ value: z.string() }),
});

export const formSubmittedEventSchema = z.object({
  type: z.literal("form.submitted"),
  payload: z.object({ form: z.string(), values: z.record(z.string(), z.any()) }),
});

export const fileUploadedEventSchema = z.object({
  type: z.literal("file.uploaded"),
  payload: z.object({
    attachmentId: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number(),
  }),
});

export const sessionClosedEventSchema = z.object({
  type: z.literal("session.closed"),
  payload: z.any().optional(),
});

export const clientEventSchema = z.discriminatedUnion("type", [
  sessionStartedEventSchema,
  userMessageEventSchema,
  userInputEventSchema,
  buttonClickedEventSchema,
  optionSelectedEventSchema,
  formSubmittedEventSchema,
  fileUploadedEventSchema,
  sessionClosedEventSchema,
]);

export const altChatEventSchema = z.object({
  sessionId: z.string().optional(),
  tenantId: z.string(),
  type: z.enum([
    "session.started",
    "user.message",
    "user.input",
    "button.clicked",
    "option.selected",
    "form.submitted",
    "file.uploaded",
    "session.closed"
  ]),
  payload: z.any().optional(),
});
