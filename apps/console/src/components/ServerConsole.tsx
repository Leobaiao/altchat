import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../config";
import { useAuth } from "../contexts/AuthContext";
import {
  Copy,
  Check,
  Activity,
  Terminal,
  Key,
  Database,
  Trash2,
  Send,
  RefreshCw,
  Search,
  Filter,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface Session {
  id: string;
  clientId: string;
  state: string;
  status: string;
  createdAt: string;
  contextJson: any;
}

interface Event {
  id: string;
  sessionId: string;
  type: string;
  payloadJson: any;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  revokedAt?: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  createdAt: string;
}

export function ServerConsole() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [flow, setFlow] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
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

  // Search & Filter for events log
  const [eventSearch, setEventSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Test Event simulation states
  const [targetSessionId, setTargetSessionId] = useState("");
  const [simulationEventType, setSimulationEventType] = useState("user.message");
  const [simulationMessage, setSimulationMessage] = useState("");
  const [simulationPayload, setSimulationPayload] = useState('{"text": "Olá, quero abrir um chamado"}');
  const [simulationStatus, setSimulationStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Loading animation state for manual refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setFlow(flowRes.data);
      setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
      setApiKeys(Array.isArray(keysRes.data) ? keysRes.data : []);
    } catch (e) {
      console.warn("Failed to load debug data from server:", e);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await load();
    setTimeout(() => setIsRefreshing(false), 600);
  }

  async function reset() {
    if (!window.confirm("Deseja mesmo resetar todas as sessões e dados? Esta ação não pode ser desfeita.")) return;
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
    } catch (e: any) {
      console.error("Failed to create API key:", e);
      setErrorMsg("Erro ao criar API Key. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeKey(id: string) {
    if (!window.confirm("Tem certeza que deseja revogar esta API Key? Ela não poderá mais ser usada.")) return;
    try {
      await axios.post(`${API_BASE}/api/admin/apikeys/${id}/revoke`, {}, { headers: authHeaders });
      await load();
    } catch (e) {
      console.error("Failed to revoke API key:", e);
      alert("Erro ao revogar chave.");
    }
  }

  async function handleSendTestEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!targetSessionId) {
      setSimulationStatus({ type: "error", msg: "Selecione uma sessão ativa." });
      return;
    }

    try {
      let finalPayload: any = {};
      if (simulationEventType === "user.message") {
        if (!simulationMessage.trim()) {
          setSimulationStatus({ type: "error", msg: "Digite uma mensagem para simular." });
          return;
        }
        finalPayload = { text: simulationMessage };
      } else {
        try {
          finalPayload = JSON.parse(simulationPayload);
        } catch {
          setSimulationStatus({ type: "error", msg: "JSON de Payload inválido." });
          return;
        }
      }

      await axios.post(
        `${API_BASE}/api/admin/sessions/${targetSessionId}/test-event`,
        {
          type: simulationEventType,
          payload: finalPayload
        },
        { headers: authHeaders }
      );

      setSimulationStatus({ type: "success", msg: "Evento enviado com sucesso!" });
      setSimulationMessage("");
      await load();
      setTimeout(() => setSimulationStatus(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSimulationStatus({ type: "error", msg: err.response?.data?.error || "Erro ao simular evento." });
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

  // Auto Scroll logs terminal container
  useEffect(() => {
    if (autoScroll && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  // Filters for events
  const filteredEvents = (Array.isArray(events) ? events : []).filter((ev) => {
    const matchesSearch = ev.type.toLowerCase().includes(eventSearch.toLowerCase()) || 
                          JSON.stringify(ev.payloadJson).toLowerCase().includes(eventSearch.toLowerCase()) ||
                          ev.sessionId.toLowerCase().includes(eventSearch.toLowerCase());
    
    if (eventTypeFilter === "all") return matchesSearch;
    return ev.type === eventTypeFilter && matchesSearch;
  });

  const activeSessionsCount = (Array.isArray(sessions) ? sessions : []).filter(s => s.status === "open").length;
  const activeKeysCount = (Array.isArray(apiKeys) ? apiKeys : []).filter(k => k.status === "active").length;

  // Log level color map
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "session.started":
        return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
      case "user.message":
      case "user.input":
        return { bg: "#dbeafe", text: "#1d4ed8", border: "#bfdbfe" };
      case "button.clicked":
      case "option.selected":
        return { bg: "#fef9c3", text: "#a16207", border: "#fef08a" };
      case "form.submitted":
        return { bg: "#fae8ff", text: "#a21caf", border: "#f5d0fe" };
      case "session.closed":
        return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto", color: "#1e293b" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.025em", color: "#0f172a" }}>
            Painel do Desenvolvedor
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Ambiente completo para gerenciar chaves, inspecionar banco de dados, simular interações e depurar fluxos.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} style={{ transition: "transform 0.5s ease" }} />
            Atualizar
          </button>
          <button
            onClick={reset}
            style={{
              padding: "10px 16px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              color: "#b91c1c",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Resetar Dados
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#10b981",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
            }}
          >
            Nova API Key
          </button>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Health Stats */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{
            backgroundColor: health?.status === "ok" ? "#dcfce7" : "#fee2e2",
            color: health?.status === "ok" ? "#16a34a" : "#dc2626",
            padding: "12px",
            borderRadius: "12px"
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Servidor</div>
            <div style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              {health?.status === "ok" ? "Online" : "Instável"}
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: health?.status === "ok" ? "#10b981" : "#ef4444",
                display: "inline-block"
              }} />
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>v{health?.version || "1.0.0"}</div>
          </div>
        </div>

        {/* Active Sessions */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "12px", borderRadius: "12px" }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Sessões Ativas</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>{activeSessionsCount}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Total: {sessions.length}</div>
          </div>
        </div>

        {/* Events KPI */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{ backgroundColor: "#fef9c3", color: "#ca8a04", padding: "12px", borderRadius: "12px" }}>
            <Terminal size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Logs Gravados</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>{events.length}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Eventos AIP / ACPP</div>
          </div>
        </div>

        {/* API Keys KPI */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <div style={{ backgroundColor: "#fae8ff", color: "#9333ea", padding: "12px", borderRadius: "12px" }}>
            <Key size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Chaves de API</div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>{activeKeysCount}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Revogadas: {apiKeys.filter(k => k.status !== "active").length}</div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        {/* Left Column: API Keys + Simulation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* API Keys Panel */}
          <div style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
              <Key size={20} color="#6366f1" />
              Credenciais e API Keys
            </h2>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>
                    <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Nome</th>
                    <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Criado em</th>
                    <th style={{ padding: "8px 4px", textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                        Nenhuma chave de acesso criada.
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                      <tr key={key.id} style={{ borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                        <td style={{ padding: "10px 4px", fontWeight: 600, color: "#334155" }}>{key.name}</td>
                        <td style={{ padding: "10px 4px" }}>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: key.status === "active" ? "#ecfdf5" : "#fee2e2",
                            color: key.status === "active" ? "#059669" : "#b91c1c",
                          }}>
                            {key.status === "active" ? "Ativa" : "Revogada"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 4px", color: "#64748b" }}>
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "10px 4px", textAlign: "right" }}>
                          {key.status === "active" && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "4px"
                              }}
                              title="Revogar Chave"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Event Simulator */}
          <div style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
              <Send size={20} color="#10b981" />
              Simulador de Eventos (Teste)
            </h2>

            {simulationStatus && (
              <div style={{
                backgroundColor: simulationStatus.type === "success" ? "#ecfdf5" : "#fee2e2",
                color: simulationStatus.type === "success" ? "#047857" : "#b91c1c",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "1rem",
                fontWeight: 500
              }}>
                {simulationStatus.msg}
              </div>
            )}

            <form onSubmit={handleSendTestEvent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                  Sessão Alvo (Ativa)
                </label>
                <select
                  value={targetSessionId}
                  onChange={(e) => setTargetSessionId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "13px"
                  }}
                  required
                >
                  <option value="">Selecione uma sessão...</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id.substring(0, 8)}... (Cliente: {s.clientId.substring(0, 8)}...) - [{s.state}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Tipo de Evento
                  </label>
                  <select
                    value={simulationEventType}
                    onChange={(e) => setSimulationEventType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  >
                    <option value="user.message">Mensagem do Usuário</option>
                    <option value="user.input">Input/Prompt Respondido</option>
                    <option value="button.clicked">Botão Clicado</option>
                    <option value="option.selected">Opção Selecionada</option>
                    <option value="form.submitted">Formulário Enviado</option>
                    <option value="session.closed">Fechar Sessão</option>
                  </select>
                </div>
              </div>

              {simulationEventType === "user.message" ? (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Texto da Mensagem
                  </label>
                  <input
                    type="text"
                    value={simulationMessage}
                    onChange={(e) => setSimulationMessage(e.target.value)}
                    placeholder="Ex: Quero falar com suporte"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "13px"
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Payload Adicional (JSON)
                  </label>
                  <textarea
                    value={simulationPayload}
                    onChange={(e) => setSimulationPayload(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace"
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "11px",
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Send size={15} />
                Disparar Evento Simulador
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Real-Time Event Log Terminal */}
        <div style={{
          background: "#090d16",
          border: "1px solid #1e293b",
          borderRadius: "20px",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          height: "640px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
        }}>
          {/* Terminal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={18} color="#10b981" />
              <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "15px" }}>Terminal de Eventos</span>
              <span style={{
                backgroundColor: "#1e293b",
                color: "#10b981",
                padding: "2px 8px",
                borderRadius: "100px",
                fontSize: "11px",
                fontWeight: 600
              }}>Live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "11px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                Auto Scroll
              </label>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={14} color="#64748b" style={{ position: "absolute", left: "10px", top: "11px" }} />
              <input
                type="text"
                placeholder="Filtrar logs..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px 8px 30px",
                  background: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                  outline: "none"
                }}
              />
            </div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              style={{
                padding: "8px",
                background: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "12px",
                outline: "none"
              }}
            >
              <option value="all">Todos os tipos</option>
              <option value="session.started">session.started</option>
              <option value="user.message">user.message</option>
              <option value="user.input">user.input</option>
              <option value="button.clicked">button.clicked</option>
              <option value="option.selected">option.selected</option>
              <option value="form.submitted">form.submitted</option>
              <option value="session.closed">session.closed</option>
            </select>
          </div>

          {/* Terminal Logs Feed */}
          <div
            ref={terminalContainerRef}
            style={{
              flex: 1,
              backgroundColor: "#020617",
              borderRadius: "12px",
              padding: "1rem",
              overflowY: "auto",
              fontFamily: "Fira Code, Consolas, Monaco, monospace",
              fontSize: "12px",
              color: "#e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              border: "1px solid #1e293b"
            }}
          >
            {filteredEvents.length === 0 ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>
                Nenhum evento registrado no feed com os filtros atuais.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const badge = getEventBadgeColor(evt.type);
                return (
                  <div key={evt.id} style={{
                    paddingBottom: "8px",
                    borderBottom: "1px solid #0f172a",
                    lineHeight: "1.4"
                  }}>
                    {/* Log Meta Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </span>
                      <span style={{
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontSize: "9px",
                        fontWeight: 700
                      }}>
                        {evt.type}
                      </span>
                      <span style={{ color: "#475569", fontSize: "10px" }}>
                        Session: {evt.sessionId.substring(0, 8)}...
                      </span>
                    </div>

                    {/* Log Payload */}
                    <pre style={{
                      margin: 0,
                      color: "#38bdf8",
                      whiteSpace: "pre-wrap",
                      fontSize: "11px",
                      paddingLeft: "4px"
                    }}>
                      {JSON.stringify(evt.payloadJson)}
                    </pre>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audit Logs & Raw Sessions Panel */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem"
      }}>
        {/* Sessions Inspection */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
            <Layers size={20} color="#3b82f6" />
            Últimas Sessões
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Session ID</th>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>State</th>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Contexto</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                      Nenhuma sessão ativa encontrada.
                    </td>
                  </tr>
                ) : (
                  sessions.slice(0, 10).map((session) => (
                    <tr key={session.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "10px 4px", fontFamily: "monospace", fontSize: "12px", color: "#475569" }}>
                        {session.id.substring(0, 12)}...
                      </td>
                      <td style={{ padding: "10px 4px" }}>
                        <span style={{
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontFamily: "monospace",
                          fontSize: "11px"
                        }}>
                          {session.state}
                        </span>
                      </td>
                      <td style={{ padding: "10px 4px" }}>
                        <span style={{
                          color: session.status === "open" ? "#059669" : "#64748b",
                          fontWeight: 600
                        }}>
                          {session.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 4px", fontSize: "11px", color: "#64748b", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {JSON.stringify(session.contextJson)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
            <FileText size={20} color="#f59e0b" />
            Logs de Auditoria Admin
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Ação</th>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Entidade</th>
                  <th style={{ padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                      Nenhum log de auditoria disponível.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "10px 4px", fontWeight: 600, color: "#475569" }}>
                        {log.action}
                      </td>
                      <td style={{ padding: "10px 4px", color: "#64748b" }}>
                        {log.entity} ({log.entityId.substring(0, 8)}...)
                      </td>
                      <td style={{ padding: "10px 4px", color: "#94a3b8", fontSize: "11px" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Custom Modal for API Key generation */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid #e2e8f0",
          }}>
            {modalStep === "input" ? (
              <form onSubmit={handleCreateKey}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                  Criar Nova API Key
                </h3>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                  Insira um nome identificável para registrar esta nova credencial no sistema.
                </p>

                {errorMsg && (
                  <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "8px", fontSize: "13px", marginBottom: "1rem", fontWeight: 500 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Nome da Credencial
                  </label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Ex: Integração Produção Widget"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                    autoFocus
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={closeModel}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      color: "#475569",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#10b981",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? "Criando..." : "Criar Chave"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", color: "#10b981" }}>
                  <CheckCircle2 size={48} />
                </div>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "20px", fontWeight: 800, color: "#0f172a", textAlign: "center" }}>
                  Chave Gerada com Sucesso!
                </h3>
                <p style={{ margin: "0 0 1.5rem 0", fontSize: "14px", color: "#64748b", lineHeight: "1.5", textAlign: "center" }}>
                  Copie e salve sua chave agora. Por motivos de segurança, ela <strong>não será exibida novamente</strong>.
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "0.75rem",
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
                      color: "#334155",
                      outline: "none"
                    }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? "#ecfdf5" : "#fff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="Copiar para área de transferência"
                  >
                    {copied ? <Check size={16} color="#059669" /> : <Copy size={16} color="#475569" />}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={closeModel}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    Fechar e Concluir
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
