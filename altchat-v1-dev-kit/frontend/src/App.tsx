import { useState } from "react";
import { AltChatClient } from "./components/AltChatClient";
import { ServerConsole } from "./components/ServerConsole";
import { MessageSquare, Server } from "lucide-react";

export function App() {
  const [tab, setTab] = useState<"client" | "console">("client");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <MessageSquare size={26} />
          <div>
            <strong>AltChat</strong>
            <span>Conversational Client Framework</span>
          </div>
        </div>

        <button className={tab === "client" ? "active" : ""} onClick={() => setTab("client")}>
          <MessageSquare size={18} />
          Client Demo
        </button>

        <button className={tab === "console" ? "active" : ""} onClick={() => setTab("console")}>
          <Server size={18} />
          Server Console
        </button>
      </aside>

      <main className="content">
        {tab === "client" ? <AltChatClient /> : <ServerConsole />}
      </main>
    </div>
  );
}
