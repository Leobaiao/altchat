import { Router, Request, Response } from "express";
import { getFlowByClientId, upsertFlow, listClients } from "../store.js";
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

// Get flow for a specific client
router.get("/:clientId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const flow = await getFlowByClientId(req.params.clientId);
    if (!flow) {
      res.json({ nodes: [], edges: [], name: "Fluxo Principal" });
      return;
    }
    res.json({
      id: flow.id,
      name: flow.name,
      nodes: flow.nodesJson,
      edges: flow.edgesJson,
      isActive: flow.isActive,
      updatedAt: flow.updatedAt
    });
  } catch (err) {
    console.error("Error getting flow:", err);
    res.status(500).json({ error: "Erro ao buscar fluxo" });
  }
});

// Save/update flow for a specific client
router.put("/:clientId", requireJwtAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { nodes, edges, name } = req.body;

    if (!nodes || !edges) {
      res.status(400).json({ error: "nodes e edges são obrigatórios" });
      return;
    }

    const flow = await upsertFlow(
      user.tenantId,
      req.params.clientId,
      nodes,
      edges,
      name
    );

    res.json({
      id: flow.id,
      name: flow.name,
      nodes: flow.nodesJson,
      edges: flow.edgesJson,
      updatedAt: flow.updatedAt
    });
  } catch (err) {
    console.error("Error saving flow:", err);
    res.status(500).json({ error: "Erro ao salvar fluxo" });
  }
});

export default router;
