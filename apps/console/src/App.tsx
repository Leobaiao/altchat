import { useState } from "react";
import { ServerConsole } from "./components/ServerConsole";
import { Dashboard } from "./components/Dashboard";
import { MessageSquare, Server, LayoutDashboard } from "lucide-react";
import "@altchat/client";

export function App() {
  const [tab, setTab] = useState<"dashboard" | "client" | "console">("dashboard");

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

        <button className={tab === "client" ? "active" : ""} onClick={() => setTab("client")}>
          <MessageSquare size={18} />
          Client Demo
        </button>

        <button className={tab === "console" ? "active" : ""} onClick={() => setTab("console")}>
          <Server size={18} />
          Server Debug
        </button>
      </aside>

      <main className="content">
        {tab === "dashboard" && <Dashboard />}
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

