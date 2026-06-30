import { useState } from "react";
import { ServerConsole } from "./components/ServerConsole";
import { Dashboard } from "./components/Dashboard";
import { Integration } from "./components/Integration";
import { Login } from "./components/Login";
import { useAuth } from "./contexts/AuthContext";
import { MessageSquare, Server, LayoutDashboard, LogOut, Code } from "lucide-react";
import "@altchat/client";

export function App() {
  const [tab, setTab] = useState<"dashboard" | "integration" | "client" | "console">("dashboard");
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Carregando...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <MessageSquare size={26} />
          <div>
            <strong>AltChat</strong>
            <span>Console Admin</span>
          </div>
        </div>

        <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button className={tab === "integration" ? "active" : ""} onClick={() => setTab("integration")}>
          <Code size={18} />
          Integração
        </button>

        <button className={tab === "client" ? "active" : ""} onClick={() => setTab("client")}>
          <MessageSquare size={18} />
          Client Demo
        </button>

        <button className={tab === "console" ? "active" : ""} onClick={() => setTab("console")}>
          <Server size={18} />
          Server Debug
        </button>

        <div style={{ flex: 1 }}></div>

        <div style={{ padding: "1rem", borderTop: "1px solid #374151", color: "#9ca3af", fontSize: "12px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>Logado como: <strong>{user.email}</strong></div>
          <div>Role: <strong>{user.role}</strong></div>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem 0" }}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      <main className="content">
        {tab === "dashboard" && <Dashboard />}
        {tab === "integration" && <Integration />}
        {tab === "client" && (
          <div className="page">
            <header className="page-header">
              <h1>Client Demo</h1>
              <p>Este painel carrega o SDK de integração como um Web Component isolado pelo Shadow DOM.</p>
            </header>
            <altchat-widget 
              tenant-id="tenant_demo" 
              client-id="client_default" 
              api-key="altchat_dev_key_12345"
            ></altchat-widget>
          </div>
        )}
        {tab === "console" && <ServerConsole />}
      </main>
    </div>
  );
}

