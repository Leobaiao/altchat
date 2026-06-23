// ACPP Types
export interface ACPP {
  protocol: "ACPP";
  version: "1.0";
  client: {
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    logoUrl?: string;
  };
  window: {
    mode: "embedded" | "popup" | "fullscreen";
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
  };
  theme: {
    mode: "light" | "dark" | "auto";
    primaryColor: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  behavior: {
    autoOpen?: boolean;
    showWelcome?: boolean;
    typingIndicator?: boolean;
    persistSession?: boolean;
  };
  capabilities: {
    text: boolean;
    file: boolean;
    image?: boolean;
    audio?: boolean;
    video?: boolean;
  };
  session: {
    timeoutSeconds: number;
    keepAlive?: boolean;
  };
}

export type AltChatPresentationConfig = ACPP;

// AIP Types
export type AICommand =
  | ShowMessageCommand
  | RequestInputCommand
  | ShowButtonsCommand
  | ShowFormCommand
  | UploadFileCommand
  | WaitCommand
  | RedirectCommand
  | ClearCommand
  | CloseCommand;

export type AltChatCommand = AICommand;

export interface ShowMessageCommand {
  action: "show_message";
  text: string;
  rich?: boolean;
}

export interface RequestInputCommand {
  action: "request_input";
  text: string;
  field: InputField;
}

export interface InputField {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  mask?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: { label: string; value: string }[];
}

export type AltChatField = InputField;

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "cpf"
  | "cnpj"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export interface ShowButtonsCommand {
  action: "show_buttons";
  text: string;
  buttons: { label: string; value: string }[];
}

export interface ShowFormCommand {
  action: "show_form";
  text: string;
  form: {
    name: string;
    submitLabel?: string;
    fields: InputField[];
  };
}

export interface UploadFileCommand {
  action: "upload_file";
  text: string;
  accept?: string[];
  required?: boolean;
  maxSizeBytes?: number;
}

export interface WaitCommand {
  action: "wait";
  text?: string;
}

export interface RedirectCommand {
  action: "redirect";
  url: string;
}

export interface ClearCommand {
  action: "clear";
}

export interface CloseCommand {
  action: "close";
  text?: string;
}

// Event Types
export type ClientEvent =
  | SessionStartedEvent
  | UserMessageEvent
  | UserInputEvent
  | ButtonClickedEvent
  | OptionSelectedEvent
  | FormSubmittedEvent
  | FileUploadedEvent
  | SessionClosedEvent;

export type AltChatEvent = {
  sessionId?: string;
  tenantId: string;
  type: ClientEvent["type"];
  payload?: any;
};

export interface SessionStartedEvent {
  type: "session.started";
  payload?: any;
}

export interface UserMessageEvent {
  type: "user.message";
  payload: { text: string };
}

export interface UserInputEvent {
  type: "user.input";
  payload: { field: string; value: any };
}

export interface ButtonClickedEvent {
  type: "button.clicked";
  payload: { value: string };
}

export interface OptionSelectedEvent {
  type: "option.selected";
  payload: { value: string };
}

export interface FormSubmittedEvent {
  type: "form.submitted";
  payload: { form: string; values: Record<string, any> };
}

export interface FileUploadedEvent {
  type: "file.uploaded";
  payload: {
    attachmentId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  };
}

export interface SessionClosedEvent {
  type: "session.closed";
  payload?: any;
}
