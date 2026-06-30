import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { handleEvent, startCommands } from "./flowEngine.js";
import { startDynamicFlow, handleDynamicEvent } from "./dynamicFlowEngine.js";
import {
  createApiKey, findSession, createSession, listSessions, createEvent,
  listEvents, createCommand, getClientConfig, listAuditLogs, getStats,
  listApiKeys, resetData, updateSessionState, getFlowByClientId
} from "./store.js";
import { AltChatEvent } from "./protocol.js";
import { validateApiKey, AuthenticatedRequest } from "./middleware/auth.js";
import { requireJwtAuth } from "./middleware/jwtAuth.js";
import { filterByTenant } from "./middleware/tenantFilter.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { auditLog } from "./middleware/auditLog.js";
import authRoutes from "./routes/authRoutes.js";
import flowRoutes from "./routes/flowRoutes.js";

const app = express();

const PORT = Number(process.env.PORT || 4300);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "5mb" }));

// ==========================================
// PUBLIC ROUTES (no auth required)
// ==========================================

app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    product: "AltChat",
    version: "1.0.0",
    concept: "Conversational Client Framework"
  });
});

app.get("/api/config/:tenantId/:clientId", async (req, res) => {
  try {
    const configData = await getClientConfig(req.params.tenantId, req.params.clientId);
    if (!configData) {
      return res.status(404).json({ error: "Client config not found" });
    }
    
    res.json({
      tenantId: req.params.tenantId,
      clientId: req.params.clientId,
      presentation: configData.config.configJson
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ==========================================
// PROTECTED ROUTES (API Key required)
// ==========================================

// Apply auth + rate limit + tenant filter to all protected routes
const protectedMiddleware = [validateApiKey, rateLimit, filterByTenant];

app.post("/api/sessions",
  ...protectedMiddleware,
  auditLog("create_session", "session"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const schema = z.object({
        tenantId: z.string().default("tenant_demo"),
        clientId: z.string().default("default"),
        externalUserId: z.string().optional()
      });

      const data = schema.parse(req.body);

      // Create session in DB
      let session = await createSession(data.tenantId, data.clientId, data.externalUserId);

      // Record start event
      await createEvent(session.tenantId, session.clientId, session.id, "session.started", {});

      // Prepare state for flow engine
      const sessionDataForFlow = {
        ...session,
        state: session.state as any,
        data: (session.contextJson as any) || {}
      };

      // Try dynamic flow first, fallback to hardcoded
      const flowRecord = await getFlowByClientId(data.clientId);
      let commands;
      if (flowRecord && flowRecord.isActive) {
        const flowData = {
          nodes: flowRecord.nodesJson as any[],
          edges: flowRecord.edgesJson as any[]
        };
        commands = startDynamicFlow(sessionDataForFlow, flowData);
      } else {
        commands = startCommands(sessionDataForFlow);
      }

      // Save commands & update session
      await createCommand(session.tenantId, session.clientId, session.id, commands);
      session = await updateSessionState(session.id, sessionDataForFlow.state, sessionDataForFlow.data);

      res.status(201).json({ session: { ...session, data: session.contextJson }, commands });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/api/events",
  ...protectedMiddleware,
  auditLog("send_event", "event"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const schema = z.object({
        sessionId: z.string(),
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
        payload: z.record(z.unknown()).optional()
      });

      const eventData = schema.parse(req.body);
      const event = eventData as AltChatEvent;
      
      let session = await findSession(eventData.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Record event in DB
      await createEvent(session.tenantId, session.clientId, session.id, event.type, event.payload || {});

      // Prepare state for flow engine
      const sessionDataForFlow = {
        ...session,
        state: session.state as any,
        data: (session.contextJson as any) || {}
      };

      // Try dynamic flow first, fallback to hardcoded
      const flowRecord = await getFlowByClientId(session.clientId);
      let commands;
      if (flowRecord && flowRecord.isActive && sessionDataForFlow.state.startsWith("flow:")) {
        const flowData = {
          nodes: flowRecord.nodesJson as any[],
          edges: flowRecord.edgesJson as any[]
        };
        commands = handleDynamicEvent(sessionDataForFlow, event, flowData);
      } else {
        commands = handleEvent(sessionDataForFlow, event);
      }

      // Save commands & update session
      await createCommand(session.tenantId, session.clientId, session.id, commands);
      session = await updateSessionState(session.id, sessionDataForFlow.state, sessionDataForFlow.data);

      res.json({
        sessionId: session.id,
        state: session.state,
        commands
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ==========================================
// ADMIN ROUTES (JWT required)
// ==========================================

app.get("/api/admin/sessions",
  requireJwtAuth, rateLimit,
  async (_req, res) => {
    res.json(await listSessions());
  }
);

app.get("/api/admin/events",
  requireJwtAuth, rateLimit,
  async (_req, res) => {
    res.json(await listEvents());
  }
);

app.get("/api/admin/stats",
  requireJwtAuth, rateLimit,
  async (_req, res) => {
    res.json(await getStats());
  }
);

app.get("/api/admin/flow",
  requireJwtAuth, rateLimit,
  (_req, res) => {
    res.json({
      name: "Demo AltChat Flow",
      description: "Fluxo server-driven para demonstrar AIP e ACPP.",
      steps: [
        "start",
        "request_name",
        "request_cpf",
        "main_menu",
        "open_ticket",
        "close"
      ]
    });
  }
);

app.get("/api/admin/audit",
  requireJwtAuth, rateLimit,
  async (_req, res) => {
    res.json(await listAuditLogs());
  }
);

app.get("/api/admin/apikeys",
  requireJwtAuth, rateLimit,
  async (_req, res) => {
    const keys = await listApiKeys();
    // Return keys without exposing hashes
    const safeKeys = keys.map(k => ({
      id: k.id,
      tenantId: k.tenantId,
      name: k.name,
      status: k.status,
      createdAt: k.createdAt,
      revokedAt: k.revokedAt,
      // We don't store keyPlain in DB anymore, so it won't be returned even in dev
    }));
    res.json(safeKeys);
  }
);

app.post("/api/admin/apikeys",
  requireJwtAuth, rateLimit,
  auditLog("create_api_key", "api_key"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100)
      });

      const data = schema.parse(req.body);
      const userPayload = (req as any).user;
      const tenantId = userPayload.tenantId; // Use tenant from JWT
      const { record, plainKey } = await createApiKey(tenantId, data.name);

      res.status(201).json({
        id: record.id,
        name: record.name,
        tenantId: record.tenantId,
        status: record.status,
        createdAt: record.createdAt,
        key: plainKey // Only returned once at creation time
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/api/admin/reset",
  requireJwtAuth, rateLimit,
  auditLog("reset_data", "system"),
  async (_req, res) => {
    await resetData();
    res.json({ ok: true });
  }
);

// Flow routes
app.use("/api/admin/flows", flowRoutes);

app.listen(PORT, () => {
  console.log(`AltChat backend running on http://localhost:${PORT}`);
});
