import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE, API_KEY } from "../config";

const authHeaders = { "X-AltChat-Api-Key": API_KEY };

export function ServerConsole() {
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [flow, setFlow] = useState<unknown>(null);
  const [health, setHealth] = useState<unknown>(null);
  const [auditLogs, setAuditLogs] = useState<unknown[]>([]);
  const [apiKeys, setApiKeys] = useState<unknown[]>([]);

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

  async function createApiKey() {
    const name = prompt("Digite um nome para a nova API Key:");
    if (!name) return;
    try {
      const res = await axios.post(`${API_BASE}/api/admin/apikeys`, { name }, { headers: authHeaders });
      alert(`API Key gerada com sucesso! Copie e salve-a, pois ela não será exibida novamente:\n\n${res.data.key}`);
      await load();
    } catch (e) {
      console.error("Failed to create API key:", e);
      alert("Erro ao criar API Key.");
    }
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
          <button onClick={createApiKey} style={{ background: "#10b981", color: "white" }}>Criar Nova API Key</button>
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
