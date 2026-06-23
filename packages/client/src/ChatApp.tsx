import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { AltChatCommand, AltChatField, ChatItem, ACPP } from "./types";
import { Send, Upload, CheckCircle } from "lucide-react";

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export interface ChatAppProps {
  tenantId: string;
  clientId: string;
  apiKey: string;
  endpoint: string;
}

export function ChatApp({ tenantId, clientId, apiKey, endpoint }: ChatAppProps) {
  const [config, setConfig] = useState<ACPP | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  async function init() {
    try {
      // 1. Carregar configuração ACPP
      const configRes = await axios.get(`${endpoint}/api/config/${tenantId}/${clientId}`);
      const acpp: ACPP = configRes.data.presentation;
      setConfig(acpp);

      // 2. Verificar Sessão no LocalStorage se persistSession for ativo
      let storedSessionId = "";
      if (acpp.behavior.persistSession) {
        const storedId = localStorage.getItem("altchat_session_id");
        const storedLastActive = localStorage.getItem("altchat_last_active");

        if (storedId && storedLastActive) {
          const elapsedSeconds = (Date.now() - Number(storedLastActive)) / 1000;
          if (elapsedSeconds < acpp.session.timeoutSeconds) {
            storedSessionId = storedId;
          }
        }
      }

      if (storedSessionId) {
        // Tentar reatar sessão existente
        setSessionId(storedSessionId);
        // Atualizar tempo de atividade
        localStorage.setItem("altchat_last_active", String(Date.now()));
        setItems([{ id: makeId("sys"), type: "system", text: "Bem-vindo de volta! Sessão restaurada." }]);
      } else {
        // Criar nova sessão
        await createNewSession();
      }
    } catch (e) {
      console.error("Erro ao inicializar o cliente AltChat:", e);
      setItems([{ id: makeId("err"), type: "system", text: "Erro de conexão com o servidor." }]);
    } finally {
      setLoading(false);
    }
  }

  async function createNewSession() {
    const response = await axios.post(`${endpoint}/api/sessions`, {
      tenantId,
      clientId,
      externalUserId: "visitor_web"
    }, {
      headers: { "X-AltChat-Api-Key": apiKey }
    });

    const newSessionId = response.data.session.id;
    setSessionId(newSessionId);

    if (config?.behavior.persistSession) {
      localStorage.setItem("altchat_session_id", newSessionId);
      localStorage.setItem("altchat_last_active", String(Date.now()));
    }

    setItems([]);
    applyCommands(response.data.commands);
  }

  function updateActivity() {
    if (config?.behavior.persistSession) {
      localStorage.setItem("altchat_last_active", String(Date.now()));
    }
  }

  function applyCommands(commands: AltChatCommand[]) {
    for (const command of commands) {
      if (command.action === "clear") {
        setItems([]);
        continue;
      }

      if (command.action === "show_message") {
        setItems(prev => [...prev, { id: makeId("sys"), type: "system", text: command.text }]);
      }

      if (command.action === "request_input") {
        setItems(prev => [
          ...prev,
          { id: makeId("input"), type: "input", text: command.text, field: command.field }
        ]);
      }

      if (command.action === "show_buttons") {
        setItems(prev => [
          ...prev,
          { id: makeId("btn"), type: "buttons", text: command.text, buttons: command.buttons }
        ]);
      }

      if (command.action === "show_form") {
        setItems(prev => [
          ...prev,
          { id: makeId("form"), type: "form", text: command.text, form: command.form }
        ]);
      }

      if (command.action === "wait") {
        setItems(prev => [...prev, { id: makeId("wait"), type: "system", text: command.text || "Aguarde..." }]);
      }

      if (command.action === "redirect") {
        window.open(command.url, "_blank");
      }

      if (command.action === "close") {
        setItems(prev => [...prev, { id: makeId("close"), type: "system", text: command.text || "Sessão encerrada." }]);
        if (config?.behavior.persistSession) {
          localStorage.removeItem("altchat_session_id");
          localStorage.removeItem("altchat_last_active");
        }
      }
    }
  }

  async function sendEvent(type: string, payload: Record<string, unknown>) {
    updateActivity();
    try {
      const response = await axios.post(`${endpoint}/api/events`, {
        sessionId,
        tenantId,
        type,
        payload
      }, {
        headers: { "X-AltChat-Api-Key": apiKey }
      });

      applyCommands(response.data.commands);
    } catch (e) {
      console.error("Erro ao enviar evento:", e);
      setItems(prev => [...prev, { id: makeId("sys"), type: "system", text: "Erro ao enviar resposta." }]);
    }
  }

  async function sendText() {
    const value = text.trim();
    if (!value) return;

    setItems(prev => [...prev, { id: makeId("user"), type: "user", text: value }]);
    setText("");

    await sendEvent("user.message", { text: value });
  }

  async function submitInput(field: AltChatField, value: string) {
    setItems(prev => [...prev, { id: makeId("user"), type: "user", text: value }]);
    await sendEvent("user.input", { field: field.name, value });
  }

  async function clickButton(value: string, label: string) {
    setItems(prev => [...prev, { id: makeId("user"), type: "user", text: label }]);
    await sendEvent("button.clicked", { value });
  }

  async function submitForm(formName: string, formData: Record<string, string>) {
    setItems(prev => [...prev, { id: makeId("user"), type: "user", text: "Formulário enviado" }]);
    await sendEvent("form.submitted", { form: formName, values: formData });
  }

  const dynamicStyles = config ? {
    "--primary-color": config.theme.primaryColor,
    "--secondary-color": config.theme.secondaryColor || "#dbeafe",
    "--background-color": config.theme.backgroundColor || "#f8fafc",
    "--text-color": config.theme.textColor || "#111827",
  } as React.CSSProperties : {};

  if (loading) {
    return (
      <div className="chat-window loading-state">
        <p>Iniciando AltChat...</p>
      </div>
    );
  }

  return (
    <div className="chat-window" style={dynamicStyles}>
      <div className="chat-header">
        <strong>{config?.client.title || "AltChat"}</strong>
        <span>{config?.client.subtitle || "Atendimento Inteligente"}</span>
      </div>

      <div className="chat-body">
        {items.map(item => {
          if (item.type === "system") {
            return <div key={item.id} className="bubble system">{item.text}</div>;
          }

          if (item.type === "user") {
            return <div key={item.id} className="bubble user">{item.text}</div>;
          }

          if (item.type === "input") {
            if (item.field.type === "file") {
              return (
                <UploadBlock
                  key={item.id}
                  item={item}
                  onUploaded={async (attachmentId: string, fileName: string, mimeType: string, sizeBytes: number) => {
                    setItems(prev => [...prev, { id: makeId("user"), type: "user", text: `Enviou arquivo: ${fileName}` }]);
                    await sendEvent("file.uploaded", { attachmentId, fileName, mimeType, sizeBytes });
                  }}
                />
              );
            }
            return <InputBlock key={item.id} item={item} onSubmit={submitInput} />;
          }

          if (item.type === "buttons") {
            return (
              <div key={item.id} className="bubble system">
                <p>{item.text}</p>
                <div className="button-list">
                  {item.buttons.map(button => (
                    <button key={button.value} onClick={() => clickButton(button.value, button.label)}>
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          if (item.type === "form") {
            return <FormBlock key={item.id} item={item} onSubmit={submitForm} />;
          }

          return null;
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        <input
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => event.key === "Enter" && sendText()}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendText}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// Blocks implementation
function InputBlock({ item, onSubmit }: any) {
  const [value, setValue] = useState("");
  return (
    <div className="bubble system">
      <p>{item.text}</p>
      <div className="inline-input">
        <input
          value={value}
          placeholder={item.field.placeholder || item.field.label || item.field.name}
          onChange={event => setValue(event.target.value)}
          onKeyDown={event => event.key === "Enter" && value.trim() && onSubmit(item.field, value)}
        />
        <button onClick={() => value.trim() && onSubmit(item.field, value)}>OK</button>
      </div>
    </div>
  );
}

function UploadBlock({ item, onUploaded }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview("");
      setDone(false);

      if (selected.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selected);
      }
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setDone(true);
    onUploaded(`att_${Date.now()}`, file.name, file.type, file.size);
  }

  return (
    <div className="bubble system form-block">
      <p>{item.text}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px 0" }}>
        <input type="file" id={`file-input-${item.id}`} style={{ display: "none" }} onChange={handleFileChange} />
        <label htmlFor={`file-input-${item.id}`} style={{ border: "1px dashed #d0d5dd", borderRadius: "10px", padding: "16px", textAlign: "center", cursor: "pointer", background: "#fcfcfd" }}>
          <Upload size={20} style={{ margin: "0 auto 8px" }} />
          <span>{file ? file.name : "Selecionar arquivo"}</span>
        </label>
        {preview && <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "8px" }} />}
        {file && !done && (
          <button onClick={handleUpload} disabled={uploading} style={{ width: "100%", padding: "10px", borderRadius: "8px" }}>
            {uploading ? "Enviando..." : "Enviar Arquivo"}
          </button>
        )}
        {done && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "green", fontWeight: 700 }}>
            <CheckCircle size={16} />
            <span>Arquivo enviado!</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FormBlock({ item, onSubmit }: any) {
  const [values, setValues] = useState<Record<string, string>>({});
  function setField(name: string, value: string) { setValues(prev => ({ ...prev, [name]: value })); }

  return (
    <div className="bubble system form-block">
      <p>{item.text}</p>
      {item.form.fields.map((field: any) => (
        <label key={field.name}>
          <span>{field.label || field.name}</span>
          {field.type === "textarea" ? (
            <textarea placeholder={field.placeholder} onChange={event => setField(field.name, event.target.value)} />
          ) : field.type === "select" ? (
            <select onChange={event => setField(field.name, event.target.value)}>
              <option value="">Selecione</option>
              {field.options?.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <input placeholder={field.placeholder} onChange={event => setField(field.name, event.target.value)} />
          )}
        </label>
      ))}
      <button onClick={() => onSubmit(item.form.name, values)}>
        {item.form.submitLabel || "Enviar"}
      </button>
    </div>
  );
}
