import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { handleEvent, startCommands } from "./flowEngine.js";
import { events, findSession, id, logEvent, now, presentationConfig, sessions } from "./store.js";
import { AltChatEvent } from "./protocol.js";

const app = express();

const PORT = Number(process.env.PORT || 4300);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    product: "AltChat",
    version: "1.0.0",
    concept: "Conversational Client Framework"
  });
});

app.get("/api/config/:tenantId/:clientId", (req, res) => {
  res.json({
    tenantId: req.params.tenantId,
    clientId: req.params.clientId,
    presentation: presentationConfig
  });
});

app.post("/api/sessions", (req, res) => {
  const schema = z.object({
    tenantId: z.string().default("tenant_demo"),
    clientId: z.string().default("default"),
    externalUserId: z.string().optional()
  });

  const data = schema.parse(req.body);

  const session = {
    id: id("sess"),
    tenantId: data.tenantId,
    clientId: data.clientId,
    externalUserId: data.externalUserId,
    state: "new" as const,
    data: {},
    createdAt: now(),
    updatedAt: now()
  };

  sessions.push(session);

  const event: AltChatEvent = {
    sessionId: session.id,
    tenantId: session.tenantId,
    type: "session.started",
    payload: {}
  };

  logEvent(event);

  const commands = startCommands(session);
  session.updatedAt = now();

  res.status(201).json({ session, commands });
});

app.post("/api/events", (req, res) => {
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

  const event = schema.parse(req.body) as AltChatEvent;
  const session = findSession(event.sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  logEvent(event);
  const commands = handleEvent(session, event);
  session.updatedAt = now();

  res.json({
    sessionId: session.id,
    state: session.state,
    commands
  });
});

app.get("/api/admin/sessions", (_req, res) => {
  res.json(sessions);
});

app.get("/api/admin/events", (_req, res) => {
  res.json(events.slice().reverse());
});

app.get("/api/admin/flow", (_req, res) => {
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
});

app.post("/api/admin/reset", (_req, res) => {
  sessions.splice(0, sessions.length);
  events.splice(0, events.length);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`AltChat backend running on http://localhost:${PORT}`);
});
