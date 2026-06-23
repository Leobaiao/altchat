import { AltChatEvent, AltChatPresentationConfig } from "./protocol.js";

export type Session = {
  id: string;
  tenantId: string;
  clientId: string;
  externalUserId?: string;
  state: "new" | "waiting_name" | "waiting_cpf" | "menu" | "ticket_form" | "closed";
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export const presentationConfig: AltChatPresentationConfig = {
  client: {
    title: "AltChat Demo",
    subtitle: "Server-driven conversation",
    avatarUrl: "",
    logoUrl: ""
  },
  window: {
    mode: "popup",
    width: 420,
    height: 680,
    minWidth: 320,
    minHeight: 500,
    resizable: true
  },
  theme: {
    mode: "light",
    primaryColor: "#2563EB",
    secondaryColor: "#111827",
    backgroundColor: "#FFFFFF",
    textColor: "#111827"
  },
  behavior: {
    autoOpen: true,
    showWelcome: true,
    typingIndicator: true,
    persistSession: true
  },
  capabilities: {
    text: true,
    file: true,
    image: true,
    audio: false,
    video: false
  },
  session: {
    timeoutSeconds: 1800,
    keepAlive: true
  }
};

export const sessions: Session[] = [];
export const events: Array<AltChatEvent & { id: string; createdAt: string }> = [];

export function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function now() {
  return new Date().toISOString();
}

export function findSession(sessionId?: string) {
  if (!sessionId) return undefined;
  return sessions.find(s => s.id === sessionId);
}

export function logEvent(event: AltChatEvent) {
  events.push({ ...event, id: id("evt"), createdAt: now() });
}
