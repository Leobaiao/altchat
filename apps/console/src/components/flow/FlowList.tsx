import React, { useState } from "react";

interface FlowItem {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isDefault: boolean;
  updatedAt: string;
}

interface FlowListProps {
  flows: FlowItem[];
  selectedFlowId: string | null;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
  onRenameFlow: (flowId: string, newName: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onPublishFlow: (flowId: string) => void;
  onArchiveFlow: (flowId: string) => void;
  onSetDefaultFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
}

const statusConfig: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  DRAFT:     { label: "Rascunho",  emoji: "🟡", color: "#92400e", bg: "#fef3c7" },
  PUBLISHED: { label: "Publicado", emoji: "🟢", color: "#065f46", bg: "#d1fae5" },
  ARCHIVED:  { label: "Arquivado", emoji: "⚫", color: "#6b7280", bg: "#f3f4f6" },
};

export function FlowList({
  flows, selectedFlowId, onSelectFlow, onCreateFlow,
  onRenameFlow, onDuplicateFlow, onPublishFlow, onArchiveFlow, onSetDefaultFlow, onDeleteFlow
}: FlowListProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleStartRename = (flow: FlowItem) => {
    setRenamingId(flow.id);
    setRenameValue(flow.name);
    setMenuOpenId(null);
  };

  const handleConfirmRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameFlow(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div style={{
      borderBottom: "1px solid #e5e7eb",
      paddingBottom: 8,
      marginBottom: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: "#374151" }}>Fluxos</h3>
        <button
          onClick={onCreateFlow}
          style={{
            padding: "3px 10px", fontSize: 12, fontWeight: 600,
            border: "1px solid #2563eb", borderRadius: 6,
            background: "#eff6ff", color: "#2563eb", cursor: "pointer",
          }}
          title="Criar novo fluxo"
        >
          + Novo
        </button>
      </div>

      {flows.length === 0 && (
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0" }}>Nenhum fluxo criado.</p>
      )}

      {flows.map(flow => {
        const sc = statusConfig[flow.status] || statusConfig.DRAFT;
        const isSelected = flow.id === selectedFlowId;

        return (
          <div
            key={flow.id}
            onClick={() => { onSelectFlow(flow.id); setMenuOpenId(null); }}
            style={{
              padding: "8px 10px",
              marginBottom: 4,
              borderRadius: 8,
              border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
              cursor: "pointer",
              backgroundColor: isSelected ? "#eff6ff" : "#fafafa",
              position: "relative",
              transition: "all 0.15s",
            }}
          >
            {/* Name or rename input */}
            {renamingId === flow.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleConfirmRename}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmRename(); if (e.key === "Escape") setRenamingId(null); }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%", fontSize: 12, fontWeight: 600,
                  padding: "2px 4px", border: "1px solid #2563eb",
                  borderRadius: 4, outline: "none", boxSizing: "border-box",
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {flow.isDefault && <span title="Fluxo Padrão" style={{ fontSize: 13 }}>⭐</span>}
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {flow.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === flow.id ? null : flow.id); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, color: "#9ca3af", padding: "0 2px",
                  }}
                  title="Ações"
                >
                  ⋮
                </button>
              </div>
            )}

            {/* Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 4,
                backgroundColor: sc.bg, color: sc.color, fontWeight: 600,
              }}>
                {sc.emoji} {sc.label}
              </span>
            </div>

            {/* Context Menu */}
            {menuOpenId === flow.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute", top: "100%", right: 4, zIndex: 100,
                  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)", padding: 4, minWidth: 150,
                }}
              >
                <MenuBtn label="✏️ Renomear" onClick={() => handleStartRename(flow)} />
                <MenuBtn label="📋 Duplicar" onClick={() => { onDuplicateFlow(flow.id); setMenuOpenId(null); }} />
                {flow.status === "DRAFT" && (
                  <MenuBtn label="🚀 Publicar" onClick={() => { onPublishFlow(flow.id); setMenuOpenId(null); }} />
                )}
                {flow.status === "PUBLISHED" && !flow.isDefault && (
                  <MenuBtn label="⭐ Definir Padrão" onClick={() => { onSetDefaultFlow(flow.id); setMenuOpenId(null); }} />
                )}
                {flow.status === "PUBLISHED" && !flow.isDefault && (
                  <MenuBtn label="📦 Arquivar" onClick={() => { onArchiveFlow(flow.id); setMenuOpenId(null); }} />
                )}
                {!flow.isDefault && (
                  <MenuBtn label="🗑️ Excluir" onClick={() => { onDeleteFlow(flow.id); setMenuOpenId(null); }} danger />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MenuBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "6px 10px", border: "none", background: "none",
        fontSize: 12, cursor: "pointer", borderRadius: 4,
        color: danger ? "#dc2626" : "#374151",
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = danger ? "#fef2f2" : "#f3f4f6"; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      {label}
    </button>
  );
}
