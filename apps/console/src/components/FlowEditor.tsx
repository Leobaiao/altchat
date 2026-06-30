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
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../config";

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
  const [flowName, setFlowName] = useState("Fluxo Principal");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Load flow for selected client
  useEffect(() => {
    if (!selectedClientId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/flows/${selectedClientId}`, { headers })
      .then(r => r.json())
      .then(data => {
        if (data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
          setEdges(data.edges || []);
          setFlowName(data.name || "Fluxo Principal");
        } else {
          setNodes([defaultStartNode]);
          setEdges([]);
          setFlowName("Fluxo Principal");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClientId]);

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
    if (!selectedClientId) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/flows/${selectedClientId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ nodes, edges, name: flowName }),
      });
      if (res.ok) {
        setSaveMessage("✅ Fluxo salvo com sucesso!");
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

        <input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 200 }}
          placeholder="Nome do fluxo"
        />

        <button
          onClick={saveFlow}
          disabled={saving || !selectedClientId}
          style={{
            padding: "6px 16px", borderRadius: 6, border: "none",
            background: "#2563eb", color: "#fff", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer", fontSize: 13,
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
        <NodePalette onAddNode={addNodeToCanvas} />

        <div ref={reactFlowWrapper} style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280" }}>
              Carregando fluxo...
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
