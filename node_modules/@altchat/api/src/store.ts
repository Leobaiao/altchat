import crypto from "crypto";
import prisma from "./db.js";

// Re-export prisma for direct access when needed
export { prisma };

// --- Types (kept for backward compatibility in flowEngine) ---
export type SessionState = "new" | "waiting_name" | "waiting_cpf" | "menu" | "ticket_form" | "closed";

export interface Session {
  id: string;
  tenantId: string;
  clientId: string;
  state: SessionState | string;
  data: Record<string, any>;
}

// --- Hash Utilities ---
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// --- ID Generators ---
export function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

// --- Tenant ---
export async function findTenant(tenantId: string) {
  return prisma.tenant.findFirst({
    where: { id: tenantId, status: "active" }
  });
}

// --- API Keys ---
export async function findApiKey(keyPlain: string) {
  const hash = hashApiKey(keyPlain);
  return prisma.apiKey.findFirst({
    where: { keyHash: hash, status: "active" }
  });
}

export async function createApiKey(tenantId: string, name: string) {
  const plainKey = `altchat_${crypto.randomBytes(16).toString("hex")}`;
  const record = await prisma.apiKey.create({
    data: {
      tenantId,
      name,
      keyHash: hashApiKey(plainKey),
      status: "active"
    }
  });
  return { record, plainKey };
}

export async function listApiKeys(tenantId?: string) {
  return prisma.apiKey.findMany({
    where: tenantId ? { tenantId } : undefined,
    orderBy: { createdAt: "desc" }
  });
}

// --- Sessions ---
export async function createSession(tenantId: string, clientId: string, externalUserId?: string) {
  return prisma.session.create({
    data: {
      tenantId,
      clientId,
      externalUserId,
      state: "new",
      contextJson: {},
      status: "open"
    }
  });
}

export async function findSession(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId }
  });
}

export async function updateSessionState(sessionId: string, state: string, contextJson?: any) {
  return prisma.session.update({
    where: { id: sessionId },
    data: {
      state,
      ...(contextJson !== undefined ? { contextJson } : {})
    }
  });
}

export async function listSessions() {
  return prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });
}

// --- Events ---
export async function createEvent(tenantId: string, clientId: string, sessionId: string, type: string, payloadJson: any) {
  return prisma.event.create({
    data: {
      tenantId,
      clientId,
      sessionId,
      type,
      payloadJson: payloadJson || {}
    }
  });
}

export async function listEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 200
  });
}

// --- Commands ---
export async function createCommand(tenantId: string, clientId: string, sessionId: string, commandsJson: any) {
  return prisma.command.create({
    data: {
      tenantId,
      clientId,
      sessionId,
      protocol: "AIP",
      version: "1.0",
      commandsJson
    }
  });
}

// --- Client Config ---
export async function getClientConfig(tenantId: string, clientId: string) {
  const client = await prisma.client.findFirst({
    where: { tenantId, id: clientId, status: "active" },
    include: {
      configs: {
        where: { isActive: true },
        take: 1
      }
    }
  });

  if (!client || client.configs.length === 0) {
    return null;
  }

  return {
    client,
    config: client.configs[0]
  };
}

// --- Audit Logs ---
export async function logAudit(
  tenantId: string,
  action: string,
  entity: string,
  entityId: string,
  actorId: string,
  ipAddress: string
) {
  return prisma.auditLog.create({
    data: {
      tenantId,
      action,
      entity,
      entityId,
      actorType: "api_client",
      actorId,
      ipAddress
    }
  });
}

export async function listAuditLogs(tenantId?: string) {
  return prisma.auditLog.findMany({
    where: tenantId ? { tenantId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200
  });
}

// --- Admin: Stats ---
export async function getStats() {
  const [openSessions, closedSessions, totalEvents, totalApiKeys] = await Promise.all([
    prisma.session.count({ where: { status: "open" } }),
    prisma.session.count({ where: { status: "closed" } }),
    prisma.event.count(),
    prisma.apiKey.count({ where: { status: "active" } })
  ]);

  // Events in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const eventsLastHour = await prisma.event.count({
    where: { createdAt: { gte: oneHourAgo } }
  });

  return {
    openSessions,
    closedSessions,
    totalEvents,
    eventsLastHour,
    activeApiKeys: totalApiKeys
  };
}

// --- Admin: Reset ---
export async function resetData() {
  // Delete in correct order due to foreign keys
  await prisma.command.deleteMany();
  await prisma.event.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
}
