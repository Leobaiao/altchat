import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

const nodeColors: Record<string, { bg: string; border: string; icon: string }> = {
  start:    { bg: "#dcfce7", border: "#16a34a", icon: "▶" },
  message:  { bg: "#dbeafe", border: "#2563eb", icon: "💬" },
  input:    { bg: "#f3e8ff", border: "#9333ea", icon: "📝" },
  buttons:  { bg: "#ffedd5", border: "#ea580c", icon: "🔘" },
  form:     { bg: "#fef3c7", border: "#d97706", icon: "📋" },
  redirect: { bg: "#fee2e2", border: "#dc2626", icon: "🔗" },
  wait:     { bg: "#f1f5f9", border: "#64748b", icon: "⏳" },
  close:    { bg: "#374151", border: "#111827", icon: "✖" },
};

const baseStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  minWidth: 180,
  fontSize: "13px",
  fontFamily: "Inter, system-ui, sans-serif",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

function NodeShell({ type, label, children, selected }: { type: string; label: string; children?: React.ReactNode; selected?: boolean }) {
  const c = nodeColors[type] || nodeColors.message;
  return (
    <div style={{
      ...baseStyle,
      background: c.bg,
      border: `2px solid ${selected ? "#2563eb" : c.border}`,
      outline: selected ? "2px solid #93c5fd" : "none",
    }}>
      <div style={{ fontWeight: 700, marginBottom: children ? 6 : 0, display: "flex", alignItems: "center", gap: 6, color: c.border === "#111827" ? "#fff" : "#111827" }}>
        <span>{c.icon}</span> {label}
      </div>
      {children && <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.4 }}>{children}</div>}
    </div>
  );
}

export const StartNode = memo(({ selected }: NodeProps) => (
  <NodeShell type="start" label="Início" selected={selected}>
    <Handle type="source" position={Position.Bottom} style={{ background: "#16a34a" }} />
  </NodeShell>
));

export const MessageNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell type="message" label="Mensagem" selected={selected}>
    <div style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(data as any).text || "Sem texto"}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </NodeShell>
));

export const InputNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell type="input" label="Input" selected={selected}>
    <div>{(data as any).fieldLabel || (data as any).fieldName || "Campo"} ({(data as any).fieldType || "text"})</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </NodeShell>
));

export const ButtonsNode = memo(({ data, selected }: NodeProps) => {
  const buttons: any[] = (data as any).buttons || [];
  return (
    <NodeShell type="buttons" label="Botões" selected={selected}>
      <Handle type="target" position={Position.Top} />
      {buttons.length === 0 && <div>Sem botões</div>}
      {buttons.map((b: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
          <span style={{ background: "#ea580c", color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>{b.label || "Botão"}</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`btn-${i}`}
            style={{ left: `${((i + 1) / (buttons.length + 1)) * 100}%`, background: "#ea580c" }}
          />
        </div>
      ))}
      {buttons.length === 0 && <Handle type="source" position={Position.Bottom} />}
    </NodeShell>
  );
});

export const FormNode = memo(({ data, selected }: NodeProps) => {
  const fields: any[] = (data as any).fields || [];
  return (
    <NodeShell type="form" label="Formulário" selected={selected}>
      <div>{fields.length} campo(s)</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </NodeShell>
  );
});

export const RedirectNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell type="redirect" label="Redirect" selected={selected}>
    <div style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(data as any).url || "https://..."}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </NodeShell>
));

export const WaitNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell type="wait" label="Aguarde" selected={selected}>
    <div>{(data as any).text || "Processando..."}</div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </NodeShell>
));

export const CloseNode = memo(({ data, selected }: NodeProps) => (
  <NodeShell type="close" label="Encerrar" selected={selected}>
    <div style={{ color: "#d1d5db" }}>{(data as any).text || "Conversa encerrada."}</div>
    <Handle type="target" position={Position.Top} />
  </NodeShell>
));

export const customNodeTypes = {
  start: StartNode,
  message: MessageNode,
  input: InputNode,
  buttons: ButtonsNode,
  form: FormNode,
  redirect: RedirectNode,
  wait: WaitNode,
  close: CloseNode,
};
