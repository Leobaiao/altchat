import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE, API_KEY } from "../config";
import { Users, CheckCircle, Activity, Key } from "lucide-react";

const authHeaders = { "X-AltChat-Api-Key": API_KEY };

type StatsData = {
  openSessions: number;
  closedSessions: number;
  totalEvents: number;
  eventsLastHour: number;
  activeApiKeys: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stats`, { headers: authHeaders });
      setStats(res.data);
    } catch (e) {
      console.warn("Failed to load stats:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    const timer = setInterval(loadStats, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !stats) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Dashboard</h1>
          <p>Carregando KPIs...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do desempenho do AltChat.</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Sessões Abertas</h3>
            <div className="kpi-value">{stats?.openSessions || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Sessões Fechadas</h3>
            <div className="kpi-value">{stats?.closedSessions || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <Activity size={24} />
          </div>
          <div className="kpi-content">
            <h3>Eventos / 1h</h3>
            <div className="kpi-value">{stats?.eventsLastHour || 0}</div>
            <div className="kpi-subtext">Total: {stats?.totalEvents || 0}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <Key size={24} />
          </div>
          <div className="kpi-content">
            <h3>API Keys</h3>
            <div className="kpi-value">{stats?.activeApiKeys || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
