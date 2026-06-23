import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { API_BASE, CLIENT_ID, TENANT_ID } from "../config";
import { AltChatCommand, AltChatField, ChatItem } from "../types";
import { Send } from "lucide-react";

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function AltChatClient() {
  const [sessionId, setSessionId] = useState<string>("");
  const [items, setItems] = useState<ChatItem[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  async function start() {
    const response = await axios.post(`${API_BASE}/api/sessions`, {
      tenantId: TENANT_ID,
      clientId: CLIENT_ID,
      externalUserId: "visitor_demo"
    });

    setSessionId(response.data.session.id);
    applyCommands(response.data.commands);
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
      }
    }
  }

  async function sendEvent(type: string, payload: Record<string, unknown>) {
    const response = await axios.post(`${API_BASE}/api/events`, {
      sessionId,
      tenantId: TENANT_ID,
      type,
      payload
    });

    applyCommands(response.data.commands);
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

  return (
    <div className="page">
      <header className="page-header">
        <h1>Client Demo</h1>
        <p>Este client executa comandos enviados pelo server-side.</p>
      </header>

      <div className="chat-window">
        <div className="chat-header">
          <strong>AltChat Demo</strong>
          <span>Server-driven conversation</span>
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
            placeholder="Digite uma mensagem..."
          />
          <button onClick={sendText}>
            <Send size={16} />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

function InputBlock({
  item,
  onSubmit
}: {
  item: Extract<ChatItem, { type: "input" }>;
  onSubmit: (field: AltChatField, value: string) => void;
}) {
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

function FormBlock({
  item,
  onSubmit
}: {
  item: Extract<ChatItem, { type: "form" }>;
  onSubmit: (formName: string, values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  function setField(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="bubble system form-block">
      <p>{item.text}</p>

      {item.form.fields.map(field => (
        <label key={field.name}>
          <span>{field.label || field.name}</span>
          {field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              onChange={event => setField(field.name, event.target.value)}
            />
          ) : field.type === "select" ? (
            <select onChange={event => setField(field.name, event.target.value)}>
              <option value="">Selecione</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              placeholder={field.placeholder}
              onChange={event => setField(field.name, event.target.value)}
            />
          )}
        </label>
      ))}

      <button onClick={() => onSubmit(item.form.name, values)}>
        {item.form.submitLabel || "Enviar"}
      </button>
    </div>
  );
}
