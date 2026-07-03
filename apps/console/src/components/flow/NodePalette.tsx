import React from "react";

const nodeTypes = [
  { type: "message",  label: "💬 Mensagem",   desc: "Exibe texto para o usuário" },
  { type: "input",    label: "📝 Input",       desc: "Solicita um dado (texto, CPF, email...)" },
  { type: "buttons",  label: "🔘 Botões",      desc: "Opções clicáveis com ramificação" },
  { type: "form",     label: "📋 Formulário",  desc: "Múltiplos campos de entrada" },
  { type: "redirect", label: "🔗 Redirect",    desc: "Redireciona para URL externa" },
  { type: "wait",     label: "⏳ Aguarde",     desc: "Indicador de carregamento" },
  { type: "close",    label: "✖ Encerrar",     desc: "Finaliza a conversa" },
];

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData("application/reactflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div style={{
      flex: 1,
    }}>
      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: 14, color: "#374151" }}>Blocos</h3>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 1rem 0" }}>Arraste para o canvas ou clique para adicionar</p>
      {nodeTypes.map(n => (
        <div
          key={n.type}
          draggable
          onDragStart={(e) => onDragStart(e, n.type)}
          onClick={() => onAddNode(n.type)}
          style={{
            padding: "10px 12px",
            marginBottom: 8,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            cursor: "grab",
            fontSize: 13,
            transition: "all 0.15s",
            backgroundColor: "#fafafa",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#2563eb"; (e.target as HTMLElement).style.backgroundColor = "#eff6ff"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#e5e7eb"; (e.target as HTMLElement).style.backgroundColor = "#fafafa"; }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{n.label}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{n.desc}</div>
        </div>
      ))}
    </div>
  );
}
