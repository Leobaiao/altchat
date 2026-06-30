import { z } from "zod";
import * as schemas from "./schemas";

export * from "./schemas";

// ACPP Types
export type ACPP = z.infer<typeof schemas.acppSchema>;
export type AltChatPresentationConfig = ACPP;

// AIP Types
export type AICommand = z.infer<typeof schemas.aiCommandSchema>;
export type AltChatCommand = AICommand;

export type ShowMessageCommand = z.infer<typeof schemas.showMessageCommandSchema>;
export type RequestInputCommand = z.infer<typeof schemas.requestInputCommandSchema>;
export type InputField = z.infer<typeof schemas.inputFieldSchema>;
export type AltChatField = InputField;
export type FieldType = z.infer<typeof schemas.fieldTypeSchema>;

export type ShowButtonsCommand = z.infer<typeof schemas.showButtonsCommandSchema>;
export type ShowFormCommand = z.infer<typeof schemas.showFormCommandSchema>;
export type UploadFileCommand = z.infer<typeof schemas.uploadFileCommandSchema>;
export type WaitCommand = z.infer<typeof schemas.waitCommandSchema>;
export type RedirectCommand = z.infer<typeof schemas.redirectCommandSchema>;
export type ClearCommand = z.infer<typeof schemas.clearCommandSchema>;
export type CloseCommand = z.infer<typeof schemas.closeCommandSchema>;

// Event Types
export type ClientEvent = z.infer<typeof schemas.clientEventSchema>;
export type AltChatEvent = z.infer<typeof schemas.altChatEventSchema>;

export type SessionStartedEvent = z.infer<typeof schemas.sessionStartedEventSchema>;
export type UserMessageEvent = z.infer<typeof schemas.userMessageEventSchema>;
export type UserInputEvent = z.infer<typeof schemas.userInputEventSchema>;
export type ButtonClickedEvent = z.infer<typeof schemas.buttonClickedEventSchema>;
export type OptionSelectedEvent = z.infer<typeof schemas.optionSelectedEventSchema>;
export type FormSubmittedEvent = z.infer<typeof schemas.formSubmittedEventSchema>;
export type FileUploadedEvent = z.infer<typeof schemas.fileUploadedEventSchema>;
export type SessionClosedEvent = z.infer<typeof schemas.sessionClosedEventSchema>;
