import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export function ServerConsole() {
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [flow, setFlow] = useState<unknown>(null);
  const [health, setHealth] = useState<unknown>(null);

  async function load() {
    const [healthRes, sessionsRes, eventsRes, flowRes] = await Promise.all([
      axios.get(`${API_BASE}/health`),
      axios.get(`${API_BASE}/api/admin/sessions`),
      axios.get(`${API_BASE}/api/admin/events`),
      axios.get(`${API_BASE}/api/admin/flow`)
    ]);

    setHealth(healthRes.data);
    setSessions(sessionsRes.data);
    setEvents(eventsRes.data);
    setFlow(flowRes.data);
  }

  async function reset() {
    await axios.post(`${API_BASE}/api/admin/reset`);
    await load();
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
        <p>Interface para o dev visualizar sessões, eventos e o fluxo demonstrativo.</p>
        <button onClick={reset}>Resetar sessões</button>
      </header>

      <section className="grid">
        <Panel title="Health" data={health} />
        <Panel title="Fluxo Demo" data={flow} />
        <Panel title="Sessões" data={sessions} />
        <Panel title="Eventos" data={events} />
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
