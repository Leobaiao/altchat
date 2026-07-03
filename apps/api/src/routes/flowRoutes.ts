import { Router, Request, Response } from "express";
import {
  listFlowsByClientId, getFlowById, createFlow, updateFlow, deleteFlow,
  publishFlow, archiveFlow, setDefaultFlow, duplicateFlow, listClients
} from "../store.js";
import { requireJwtAuth } from "../middleware/jwtAuth.js";

const router = Router();

// List clients (for the dropdown in the flow editor)
router.get("/clients", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const clients = await listClients(user.tenantId);
    res.json(clients);
  } catch (err) {
    console.error("Error listing clients:", err);
    res.status(500).json({ error: "Erro ao listar clients" });
  }
});

// List all flows for a client
router.get("/:clientId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flows = await listFlowsByClientId(req.params.clientId);
    const result = flows.map(f => ({
      id: f.id,
      name: f.name,
      status: f.status,
      isDefault: f.isDefault,
      nodesJson: f.nodesJson,
      edgesJson: f.edgesJson,
      updatedAt: f.updatedAt,
      createdAt: f.createdAt
    }));
    res.json(result);
  } catch (err) {
    console.error("Error listing flows:", err);
    res.status(500).json({ error: "Erro ao listar fluxos" });
  }
});

// Get a single flow by ID
router.get("/:clientId/:flowId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flow = await getFlowById(req.params.flowId);
    if (!flow) {
      res.status(404).json({ error: "Fluxo não encontrado" });
      return;
    }
    res.json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      nodesJson: flow.nodesJson,
      edgesJson: flow.edgesJson,
      updatedAt: flow.updatedAt,
      createdAt: flow.createdAt
    });
  } catch (err) {
    console.error("Error getting flow:", err);
    res.status(500).json({ error: "Erro ao buscar fluxo" });
  }
});

// Create a new flow
router.post("/:clientId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name } = req.body;
    const flow = await createFlow(user.tenantId, req.params.clientId, name || "Novo Fluxo");
    res.status(201).json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      nodesJson: flow.nodesJson,
      edgesJson: flow.edgesJson,
      updatedAt: flow.updatedAt,
      createdAt: flow.createdAt
    });
  } catch (err) {
    console.error("Error creating flow:", err);
    res.status(500).json({ error: "Erro ao criar fluxo" });
  }
});

// Update a flow (save nodes/edges/name)
router.put("/:clientId/:flowId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const { nodes, edges, name } = req.body;
    const flow = await updateFlow(req.params.flowId, {
      nodesJson: nodes,
      edgesJson: edges,
      name
    });
    res.json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      nodesJson: flow.nodesJson,
      edgesJson: flow.edgesJson,
      updatedAt: flow.updatedAt
    });
  } catch (err) {
    console.error("Error saving flow:", err);
    res.status(500).json({ error: "Erro ao salvar fluxo" });
  }
});

// Delete a flow
router.delete("/:clientId/:flowId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    await deleteFlow(req.params.flowId);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("Error deleting flow:", err);
    res.status(400).json({ error: err.message || "Erro ao excluir fluxo" });
  }
});

// Publish a flow
router.post("/:clientId/:flowId/publish", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flow = await publishFlow(req.params.flowId);
    res.json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      updatedAt: flow.updatedAt
    });
  } catch (err: any) {
    console.error("Error publishing flow:", err);
    res.status(400).json({ error: err.message || "Erro ao publicar fluxo" });
  }
});

// Archive a flow
router.post("/:clientId/:flowId/archive", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flow = await archiveFlow(req.params.flowId);
    res.json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      updatedAt: flow.updatedAt
    });
  } catch (err: any) {
    console.error("Error archiving flow:", err);
    res.status(400).json({ error: err.message || "Erro ao arquivar fluxo" });
  }
});

// Set default flow
router.post("/:clientId/:flowId/default", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flow = await setDefaultFlow(req.params.clientId, req.params.flowId);
    res.json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      updatedAt: flow.updatedAt
    });
  } catch (err: any) {
    console.error("Error setting default flow:", err);
    res.status(400).json({ error: err.message || "Erro ao definir fluxo padrão" });
  }
});

// Duplicate a flow
router.post("/:clientId/:flowId/duplicate", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const flow = await duplicateFlow(req.params.flowId, name || "Cópia do fluxo");
    res.status(201).json({
      id: flow.id,
      name: flow.name,
      status: flow.status,
      isDefault: flow.isDefault,
      nodesJson: flow.nodesJson,
      edgesJson: flow.edgesJson,
      updatedAt: flow.updatedAt,
      createdAt: flow.createdAt
    });
  } catch (err: any) {
    console.error("Error duplicating flow:", err);
    res.status(400).json({ error: err.message || "Erro ao duplicar fluxo" });
  }
});

export default router;
