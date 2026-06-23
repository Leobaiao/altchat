export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "cpf"
  | "cnpj"
  | "number"
  | "date"
  | "datetime"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

export type AltChatField = {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
};

export type AltChatCommand =
  | { action: "show_message"; text: string }
  | { action: "request_input"; text: string; field: AltChatField }
  | { action: "show_buttons"; text: string; buttons: Array<{ label: string; value: string }> }
  | { action: "show_form"; text: string; form: { name: string; submitLabel?: string; fields: AltChatField[] } }
  | { action: "upload_file"; text: string; accept?: string[]; required?: boolean }
  | { action: "wait"; text?: string }
  | { action: "redirect"; url: string }
  | { action: "clear" }
  | { action: "close"; text?: string };

export type AltChatEvent = {
  sessionId?: string;
  tenantId: string;
  type:
    | "session.started"
    | "user.message"
    | "user.input"
    | "button.clicked"
    | "option.selected"
    | "form.submitted"
    | "file.uploaded"
    | "session.closed";
  payload?: Record<string, unknown>;
};

export type AltChatPresentationConfig = {
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
    image: boolean;
    audio: boolean;
    video: boolean;
  };
  session: {
    timeoutSeconds: number;
    keepAlive: boolean;
  };
};
