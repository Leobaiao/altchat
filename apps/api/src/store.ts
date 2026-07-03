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

export async function revokeApiKey(id: string) {
  return prisma.apiKey.update({
    where: { id },
    data: {
      status: "revoked",
      revokedAt: new Date()
    }
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

// --- Users ---
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { tenant: true }
  });
}

export async function createUser(tenantId: string, email: string, passwordHash: string, role: "ADMIN" | "OPERATOR" | "VIEWER" = "VIEWER") {
  return prisma.user.create({
    data: {
      tenantId,
      email,
      passwordHash,
      role
    }
  });
}

// --- Flows ---

/** Get the default published flow for a client (used at runtime) */
export async function getDefaultFlowByClientId(clientId: string) {
  return prisma.flow.findFirst({
    where: { clientId, isDefault: true, status: "PUBLISHED" }
  });
}

/** Legacy alias — used by server.ts session creation */
export async function getFlowByClientId(clientId: string) {
  return getDefaultFlowByClientId(clientId);
}

/** List all flows for a client */
export async function listFlowsByClientId(clientId: string) {
  return prisma.flow.findMany({
    where: { clientId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });
}

/** Get a single flow by ID */
export async function getFlowById(flowId: string) {
  return prisma.flow.findUnique({ where: { id: flowId } });
}

/** Create a new flow (starts as DRAFT) */
export async function createFlow(tenantId: string, clientId: string, name: string) {
  return prisma.flow.create({
    data: {
      tenantId,
      clientId,
      name,
      status: "DRAFT",
      isDefault: false,
      nodesJson: [],
      edgesJson: []
    }
  });
}

/** Update a flow's nodes, edges and/or name */
export async function updateFlow(flowId: string, data: { nodesJson?: any; edgesJson?: any; name?: string }) {
  return prisma.flow.update({
    where: { id: flowId },
    data: {
      ...(data.nodesJson !== undefined ? { nodesJson: data.nodesJson } : {}),
      ...(data.edgesJson !== undefined ? { edgesJson: data.edgesJson } : {}),
      ...(data.name !== undefined ? { name: data.name } : {})
    }
  });
}

/** Delete a flow (will fail if it's the default) */
export async function deleteFlow(flowId: string) {
  const flow = await prisma.flow.findUnique({ where: { id: flowId } });
  if (!flow) throw new Error("Flow not found");
  if (flow.isDefault) throw new Error("Cannot delete the default flow. Set another flow as default first.");
  return prisma.flow.delete({ where: { id: flowId } });
}

/** Publish a flow (change status from DRAFT to PUBLISHED) */
export async function publishFlow(flowId: string) {
  return prisma.flow.update({
    where: { id: flowId },
    data: { status: "PUBLISHED" }
  });
}

/** Archive a flow */
export async function archiveFlow(flowId: string) {
  const flow = await prisma.flow.findUnique({ where: { id: flowId } });
  if (!flow) throw new Error("Flow not found");
  if (flow.isDefault) throw new Error("Cannot archive the default flow. Set another flow as default first.");
  return prisma.flow.update({
    where: { id: flowId },
    data: { status: "ARCHIVED", isDefault: false }
  });
}

/** Set a flow as the default for its client (must be PUBLISHED) */
export async function setDefaultFlow(clientId: string, flowId: string) {
  const flow = await prisma.flow.findUnique({ where: { id: flowId } });
  if (!flow) throw new Error("Flow not found");
  if (flow.status !== "PUBLISHED") throw new Error("Only published flows can be set as default.");

  // Remove default from all other flows of this client
  await prisma.flow.updateMany({
    where: { clientId, isDefault: true },
    data: { isDefault: false }
  });

  // Set this flow as default
  return prisma.flow.update({
    where: { id: flowId },
    data: { isDefault: true }
  });
}

/** Duplicate a flow as a new DRAFT */
export async function duplicateFlow(flowId: string, newName: string) {
  const original = await prisma.flow.findUnique({ where: { id: flowId } });
  if (!original) throw new Error("Flow not found");

  return prisma.flow.create({
    data: {
      tenantId: original.tenantId,
      clientId: original.clientId,
      name: newName,
      status: "DRAFT",
      isDefault: false,
      nodesJson: original.nodesJson as any,
      edgesJson: original.edgesJson as any
    }
  });
}

// --- Legacy upsert (kept for backward compatibility) ---
export async function upsertFlow(tenantId: string, clientId: string, nodesJson: any, edgesJson: any, name?: string) {
  // Find existing default flow or create one
  const existing = await prisma.flow.findFirst({ where: { clientId, isDefault: true } });
  if (existing) {
    return prisma.flow.update({
      where: { id: existing.id },
      data: { nodesJson, edgesJson, ...(name ? { name } : {}) }
    });
  }
  return prisma.flow.create({
    data: {
      tenantId,
      clientId,
      nodesJson,
      edgesJson,
      name: name || "Fluxo Principal",
      status: "PUBLISHED",
      isDefault: true
    }
  });
}

export async function listClients(tenantId?: string) {
  return prisma.client.findMany({
    where: tenantId ? { tenantId, status: "active" } : { status: "active" },
    orderBy: { createdAt: "desc" }
  });
}

