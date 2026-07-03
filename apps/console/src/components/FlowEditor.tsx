import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { customNodeTypes } from "./flow/CustomNodes";
import { NodePalette } from "./flow/NodePalette";
import { NodeEditorPanel } from "./flow/NodeEditorPanel";
import { FlowList } from "./flow/FlowList";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../config";

interface FlowItem {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isDefault: boolean;
  nodesJson: any;
  edgesJson: any;
  updatedAt: string;
  createdAt: string;
}

const defaultStartNode: Node = {
  id: "start-1",
  type: "start",
  position: { x: 300, y: 50 },
  data: {},
};

function FlowEditorInner() {
  const { token, user } = useAuth();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([defaultStartNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Multi-flow state
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedFlowName, setSelectedFlowName] = useState<string>("Novo Fluxo");
  const [selectedFlowStatus, setSelectedFlowStatus] = useState<string>("DRAFT");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Load clients
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/flows/clients`, { headers })
      .then(r => r.json())
      .then(data => {
        setClients(data);
        if (data.length > 0) setSelectedClientId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Load flows for selected client
  const loadFlows = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}`, { headers });
      const data = await res.json();
      const flowList: FlowItem[] = Array.isArray(data) ? data : [];
      setFlows(flowList);

      // Auto-select the first flow if none selected or current selection is gone
      if (flowList.length > 0) {
        const currentStillExists = selectedFlowId && flowList.some(f => f.id === selectedFlowId);
        if (!currentStillExists) {
          loadFlowIntoCanvas(flowList[0]);
        }
      } else {
        setSelectedFlowId(null);
        setSelectedFlowName("Novo Fluxo");
        setSelectedFlowStatus("DRAFT");
        setNodes([defaultStartNode]);
        setEdges([]);
      }
    } catch (err) {
      console.error("Error loading flows:", err);
    }
  }, [selectedClientId, selectedFlowId]);

  useEffect(() => {
    if (selectedClientId) {
      setSelectedFlowId(null);
      loadFlows();
    }
  }, [selectedClientId]);

  const loadFlowIntoCanvas = (flow: FlowItem) => {
    setSelectedFlowId(flow.id);
    setSelectedFlowName(flow.name);
    setSelectedFlowStatus(flow.status);
    const flowNodes = Array.isArray(flow.nodesJson) ? flow.nodesJson : [];
    const flowEdges = Array.isArray(flow.edgesJson) ? flow.edgesJson : [];
    if (flowNodes.length > 0) {
      setNodes(flowNodes);
      setEdges(flowEdges);
    } else {
      setNodes([defaultStartNode]);
      setEdges([]);
    }
  };

  const handleSelectFlow = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) loadFlowIntoCanvas(flow);
  };

  // --- Flow CRUD handlers ---

  const handleCreateFlow = async () => {
    if (!selectedClientId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}`, {
        method: "POST", headers,
        body: JSON.stringify({ name: "Novo Fluxo" })
      });
      if (res.ok) {
        const newFlow = await res.json();
        await loadFlows();
        loadFlowIntoCanvas(newFlow);
      }
    } catch (err) { console.error("Error creating flow:", err); }
  };

  const handleRenameFlow = async (flowId: string, newName: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}`, {
        method: "PUT", headers,
        body: JSON.stringify({ name: newName })
      });
      if (flowId === selectedFlowId) setSelectedFlowName(newName);
      await loadFlows();
    } catch (err) { console.error("Error renaming flow:", err); }
  };

  const handleDuplicateFlow = async (flowId: string) => {
    const original = flows.find(f => f.id === flowId);
    try {
      await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}/duplicate`, {
        method: "POST", headers,
        body: JSON.stringify({ name: `${original?.name || "Fluxo"} (Cópia)` })
      });
      await loadFlows();
    } catch (err) { console.error("Error duplicating flow:", err); }
  };

  const handlePublishFlow = async (flowId: string) => {
    try {
      await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}/publish`, {
        method: "POST", headers
      });
      if (flowId === selectedFlowId) setSelectedFlowStatus("PUBLISHED");
      await loadFlows();
    } catch (err) { console.error("Error publishing flow:", err); }
  };

  const handleArchiveFlow = async (flowId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}/archive`, {
        method: "POST", headers
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao arquivar");
        return;
      }
      await loadFlows();
    } catch (err) { console.error("Error archiving flow:", err); }
  };

  const handleSetDefaultFlow = async (flowId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}/default`, {
        method: "POST", headers
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao definir padrão");
        return;
      }
      await loadFlows();
    } catch (err) { console.error("Error setting default:", err); }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm("Tem certeza que deseja excluir este fluxo?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${flowId}`, {
        method: "DELETE", headers
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
        return;
      }
      await loadFlows();
    } catch (err) { console.error("Error deleting flow:", err); }
  };

  // --- Canvas interaction handlers ---

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onUpdateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...newData } } : n))
    );
    setSelectedNode((prev) => prev && prev.id === nodeId ? { ...prev, data: newData } : prev);
  }, []);

  const addNodeToCanvas = useCallback((type: string) => {
    const id = `${type}-${Date.now()}`;
    const defaultData: Record<string, any> = {
      message: { text: "Nova mensagem" },
      input: { text: "Informe o dado:", fieldName: "campo", fieldLabel: "Campo", fieldType: "text", fieldPlaceholder: "" },
      buttons: { text: "Escolha uma opção:", buttons: [{ label: "Opção 1", value: "opt_1" }, { label: "Opção 2", value: "opt_2" }] },
      form: { text: "Preencha o formulário:", formName: "form", submitLabel: "Enviar", fields: [{ name: "campo1", label: "Campo 1", type: "text", required: true }] },
      redirect: { url: "https://example.com" },
      wait: { text: "Aguarde..." },
      close: { text: "Conversa encerrada. Obrigado!" },
    };

    const newNode: Node = {
      id,
      type,
      position: { x: 250 + Math.random() * 200, y: 150 + Math.random() * 300 },
      data: defaultData[type] || {},
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/reactflow");
    if (!type) return;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

    const defaultData: Record<string, any> = {
      message: { text: "Nova mensagem" },
      input: { text: "Informe o dado:", fieldName: "campo", fieldLabel: "Campo", fieldType: "text" },
      buttons: { text: "Escolha:", buttons: [{ label: "Opção 1", value: "opt_1" }] },
      form: { text: "Preencha:", formName: "form", submitLabel: "Enviar", fields: [] },
      redirect: { url: "https://example.com" },
      wait: { text: "Aguarde..." },
      close: { text: "Conversa encerrada." },
    };

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: defaultData[type] || {},
    };
    setNodes((nds) => [...nds, newNode]);
  }, [screenToFlowPosition]);

  const saveFlow = async () => {
    if (!selectedClientId || !selectedFlowId) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}/${selectedFlowId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ nodes, edges, name: selectedFlowName }),
      });
      if (res.ok) {
        setSaveMessage("✅ Fluxo salvo com sucesso!");
        await loadFlows();
      } else {
        const err = await res.json();
        setSaveMessage(`❌ Erro: ${err.error}`);
      }
    } catch (e) {
      setSaveMessage("❌ Erro de rede ao salvar.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 4000);
    }
  };

  // Status badge for toolbar
  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT: { bg: "#fef3c7", color: "#92400e", label: "🟡 Rascunho" },
    PUBLISHED: { bg: "#d1fae5", color: "#065f46", label: "🟢 Publicado" },
    ARCHIVED: { bg: "#f3f4f6", color: "#6b7280", label: "⚫ Arquivado" },
  };

  const currentStatus = statusColors[selectedFlowStatus] || statusColors.DRAFT;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
        borderBottom: "1px solid #e5e7eb", backgroundColor: "#fff", flexShrink: 0,
      }}>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name} ({c.clientKey})</option>
          ))}
        </select>

        {selectedFlowId && (
          <>
            <span style={{ fontSize: 13, color: "#6b7280" }}>▸</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{selectedFlowName}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              backgroundColor: currentStatus.bg, color: currentStatus.color, fontWeight: 600,
            }}>
              {currentStatus.label}
            </span>
          </>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={saveFlow}
          disabled={saving || !selectedClientId || !selectedFlowId}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "none",
            background: !selectedFlowId ? "#9ca3af" : "#2563eb", color: "#fff", fontWeight: 600,
            cursor: (saving || !selectedFlowId) ? "not-allowed" : "pointer", fontSize: 13,
          }}
        >
          {saving ? "Salvando..." : "💾 Salvar Fluxo"}
        </button>

        {saveMessage && (
          <span style={{ fontSize: 13, color: saveMessage.startsWith("✅") ? "#16a34a" : "#dc2626" }}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Editor Area */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left sidebar: FlowList + NodePalette */}
        <div style={{
          width: 220,
          backgroundColor: "#fff",
          borderRight: "1px solid #e5e7eb",
          padding: "1rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          <FlowList
            flows={flows}
            selectedFlowId={selectedFlowId}
            onSelectFlow={handleSelectFlow}
            onCreateFlow={handleCreateFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onPublishFlow={handlePublishFlow}
            onArchiveFlow={handleArchiveFlow}
            onSetDefaultFlow={handleSetDefaultFlow}
            onDeleteFlow={handleDeleteFlow}
          />
          <NodePalette onAddNode={addNodeToCanvas} />
        </div>

        <div ref={reactFlowWrapper} style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280" }}>
              Carregando fluxo...
            </div>
          ) : !selectedFlowId ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 32 }}>📋</span>
              <span style={{ fontSize: 14 }}>Selecione ou crie um fluxo na barra lateral</span>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDragOver={onDragOver}
              onDrop={onDrop}
              nodeTypes={customNodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
              style={{ backgroundColor: "#f8fafc" }}
            >
              <Background color="#d1d5db" gap={20} />
              <Controls />
              <MiniMap
                nodeStrokeColor="#6b7280"
                nodeColor={(n) => {
                  const colors: Record<string, string> = {
                    start: "#dcfce7", message: "#dbeafe", input: "#f3e8ff",
                    buttons: "#ffedd5", form: "#fef3c7", redirect: "#fee2e2",
                    wait: "#f1f5f9", close: "#374151",
                  };
                  return colors[n.type || ""] || "#e5e7eb";
                }}
                style={{ borderRadius: 8 }}
              />
            </ReactFlow>
          )}
        </div>

        {selectedNode && (
          <NodeEditorPanel
            node={selectedNode}
            onUpdate={onUpdateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

export function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
