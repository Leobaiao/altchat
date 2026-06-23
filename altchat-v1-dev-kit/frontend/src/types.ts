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

export type ChatItem =
  | { id: string; type: "system"; text: string }
  | { id: string; type: "user"; text: string }
  | { id: string; type: "input"; text: string; field: AltChatField }
  | { id: string; type: "buttons"; text: string; buttons: Array<{ label: string; value: string }> }
  | { id: string; type: "form"; text: string; form: { name: string; submitLabel?: string; fields: AltChatField[] } };
