import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { Copy, Check } from "lucide-react";

export function ServerConsole() {
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [flow, setFlow] = useState<unknown>(null);
  const [health, setHealth] = useState<unknown>(null);
  const [auditLogs, setAuditLogs] = useState<unknown[]>([]);
  const [apiKeys, setApiKeys] = useState<unknown[]>([]);
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  // States for custom modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"input" | "success">("input");
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function load() {
    try {
      const [healthRes, sessionsRes, eventsRes, flowRes, auditRes, keysRes] = await Promise.all([
        axios.get(`${API_BASE}/health`),
        axios.get(`${API_BASE}/api/admin/sessions`, { headers: authHeaders }),
        axios.get(`${API_BASE}/api/admin/events`, { headers: authHeaders }),
        axios.get(`${API_BASE}/api/admin/flow`, { headers: authHeaders }),
        axios.get(`${API_BASE}/api/admin/audit`, { headers: authHeaders }),
        axios.get(`${API_BASE}/api/admin/apikeys`, { headers: authHeaders })
      ]);

      setHealth(healthRes.data);
      setSessions(sessionsRes.data);
      setEvents(eventsRes.data);
      setFlow(flowRes.data);
      setAuditLogs(auditRes.data);
      setApiKeys(keysRes.data);
    } catch (e) {
      console.warn("Failed to load debug data from server:", e);
    }
  }

  async function reset() {
    try {
      await axios.post(`${API_BASE}/api/admin/reset`, {}, { headers: authHeaders });
      await load();
    } catch (e) {
      console.warn("Failed to reset sessions:", e);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/apikeys`,
        { name: keyName },
        { headers: authHeaders }
      );
      setGeneratedKey(res.data.key);
      setModalStep("success");
      await load();
    } catch (e) {
      console.error("Failed to create API key:", e);
      setErrorMsg("Erro ao criar API Key. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeModel() {
    setIsModalOpen(false);
    setModalStep("input");
    setKeyName("");
    setGeneratedKey("");
    setErrorMsg("");
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Server Console</h1>
        <p>Interface para o dev visualizar sessões, eventos, audit logs e API Keys.</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button onClick={reset}>Resetar sessões</button>
          <button onClick={() => setIsModalOpen(true)} style={{ background: "#10b981", color: "white" }}>Criar Nova API Key</button>
        </div>
      </header>

      <section className="grid">
        <Panel title="Health" data={health} />
        <Panel title="Fluxo Demo" data={flow} />
        <Panel title="Sessões" data={sessions} />
        <Panel title="Eventos" data={events} />
        <Panel title="Audit Logs" data={auditLogs} />
        <Panel title="API Keys" data={apiKeys} />
      </section>

      {/* Custom Alert/Prompt Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e5e7eb",
          }}>
            {modalStep === "input" ? (
              <form onSubmit={handleCreateKey}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                  Criar Nova API Key
                </h3>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "14px", color: "#6b7280" }}>
                  Digite um nome descritivo para que você possa identificar esta chave de acesso futuramente.
                </p>

                {errorMsg && (
                  <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", fontSize: "13px", marginBottom: "1rem" }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Nome da Chave
                  </label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Ex: Integração Site Principal"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    }}
                    autoFocus
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={closeModel}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "#10b981",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Criando..." : "Criar Chave"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                  Chave Gerada com Sucesso! 🎉
                </h3>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                  Copie e salve sua chave agora. Por motivos de segurança, ela <strong>não será exibida novamente</strong>.
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "1.5rem",
                }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedKey}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      color: "#374151",
                      outline: "none",
                    }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? "#d1fae5" : "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    title="Copiar para área de transferência"
                  >
                    {copied ? <Check size={16} color="#059669" /> : <Copy size={16} color="#4b5563" />}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={closeModel}
                    style={{
                      padding: "0.625rem 1.5rem",
                      backgroundColor: "#111827",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Panel({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
