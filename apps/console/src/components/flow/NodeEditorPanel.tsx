import React from "react";

interface NodeEditorPanelProps {
  node: any | null;
  onUpdate: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

export function NodeEditorPanel({ node, onUpdate, onClose }: NodeEditorPanelProps) {
  if (!node) return null;

  const data = node.data || {};

  const update = (key: string, value: any) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  const updateButton = (index: number, field: string, value: string) => {
    const buttons = [...(data.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    onUpdate(node.id, { ...data, buttons });
  };

  const addButton = () => {
    const buttons = [...(data.buttons || []), { label: `Opção ${(data.buttons || []).length + 1}`, value: `opt_${(data.buttons || []).length + 1}` }];
    onUpdate(node.id, { ...data, buttons });
  };

  const removeButton = (index: number) => {
    const buttons = (data.buttons || []).filter((_: any, i: number) => i !== index);
    onUpdate(node.id, { ...data, buttons });
  };

  const updateFormField = (index: number, field: string, value: any) => {
    const fields = [...(data.fields || [])];
    fields[index] = { ...fields[index], [field]: value };
    onUpdate(node.id, { ...data, fields });
  };

  const addFormField = () => {
    const fields = [...(data.fields || []), { name: `field_${(data.fields || []).length + 1}`, label: "Novo Campo", type: "text", required: true }];
    onUpdate(node.id, { ...data, fields });
  };

  const removeFormField = (index: number) => {
    const fields = (data.fields || []).filter((_: any, i: number) => i !== index);
    onUpdate(node.id, { ...data, fields });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, marginTop: 4
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 12
  };

  return (
    <div style={{
      width: 280,
      backgroundColor: "#fff",
      borderLeft: "1px solid #e5e7eb",
      padding: "1rem",
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: "#111827" }}>Editar Nó</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6b7280" }}>✕</button>
      </div>

      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
        Tipo: <strong>{node.type}</strong> | ID: <code style={{ fontSize: 11 }}>{node.id.substring(0, 8)}</code>
      </div>

      {/* Text property (most nodes) */}
      {["message", "input", "buttons", "form", "wait", "close"].includes(node.type) && (
        <>
          <label style={labelStyle}>Texto</label>
          <textarea
            value={data.text || ""}
            onChange={(e) => update("text", e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </>
      )}

      {/* Input-specific fields */}
      {node.type === "input" && (
        <>
          <label style={labelStyle}>Nome do Campo</label>
          <input value={data.fieldName || ""} onChange={(e) => update("fieldName", e.target.value)} style={inputStyle} placeholder="ex: name, cpf, email" />

          <label style={labelStyle}>Label</label>
          <input value={data.fieldLabel || ""} onChange={(e) => update("fieldLabel", e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Tipo</label>
          <select value={data.fieldType || "text"} onChange={(e) => update("fieldType", e.target.value)} style={inputStyle}>
            <option value="text">Texto</option>
            <option value="email">E-mail</option>
            <option value="phone">Telefone</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="number">Número</option>
            <option value="textarea">Textarea</option>
            <option value="date">Data</option>
          </select>

          <label style={labelStyle}>Placeholder</label>
          <input value={data.fieldPlaceholder || ""} onChange={(e) => update("fieldPlaceholder", e.target.value)} style={inputStyle} />
        </>
      )}

      {/* Buttons-specific editor */}
      {node.type === "buttons" && (
        <>
          <label style={labelStyle}>Botões</label>
          {(data.buttons || []).map((b: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 4, marginTop: 6, alignItems: "center" }}>
              <input value={b.label || ""} onChange={(e) => updateButton(i, "label", e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 1 }} placeholder="Label" />
              <input value={b.value || ""} onChange={(e) => updateButton(i, "value", e.target.value)} style={{ ...inputStyle, marginTop: 0, flex: 1 }} placeholder="Valor" />
              <button onClick={() => removeButton(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}>✕</button>
            </div>
          ))}
          <button onClick={addButton} style={{ marginTop: 8, padding: "4px 10px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#f9fafb" }}>
            + Adicionar Botão
          </button>
        </>
      )}

      {/* Form-specific editor */}
      {node.type === "form" && (
        <>
          <label style={labelStyle}>Nome do Formulário</label>
          <input value={data.formName || ""} onChange={(e) => update("formName", e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Label do Botão</label>
          <input value={data.submitLabel || ""} onChange={(e) => update("submitLabel", e.target.value)} style={inputStyle} placeholder="Enviar" />

          <label style={labelStyle}>Campos</label>
          {(data.fields || []).map((f: any, i: number) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 8, marginTop: 6, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Campo {i + 1}</strong>
                <button onClick={() => removeFormField(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14 }}>✕</button>
              </div>
              <input value={f.name || ""} onChange={(e) => updateFormField(i, "name", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} placeholder="Nome (ex: subject)" />
              <input value={f.label || ""} onChange={(e) => updateFormField(i, "label", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} placeholder="Label" />
              <select value={f.type || "text"} onChange={(e) => updateFormField(i, "type", e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
                <option value="text">Texto</option>
                <option value="textarea">Textarea</option>
                <option value="email">E-mail</option>
                <option value="select">Select</option>
                <option value="number">Número</option>
              </select>
            </div>
          ))}
          <button onClick={addFormField} style={{ marginTop: 8, padding: "4px 10px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", background: "#f9fafb" }}>
            + Adicionar Campo
          </button>
        </>
      )}

      {/* Redirect-specific */}
      {node.type === "redirect" && (
        <>
          <label style={labelStyle}>URL de Destino</label>
          <input value={data.url || ""} onChange={(e) => update("url", e.target.value)} style={inputStyle} placeholder="https://..." />
        </>
      )}
    </div>
  );
}
