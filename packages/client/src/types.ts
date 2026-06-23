import { AltChatField } from "@altchat/protocol";

export * from "@altchat/protocol";

export type ChatItem =
  | { id: string; type: "system"; text: string }
  | { id: string; type: "user"; text: string }
  | { id: string; type: "input"; text: string; field: AltChatField }
  | { id: string; type: "buttons"; text: string; buttons: Array<{ label: string; value: string }> }
  | { id: string; type: "form"; text: string; form: { name: string; submitLabel?: string; fields: AltChatField[] } };
