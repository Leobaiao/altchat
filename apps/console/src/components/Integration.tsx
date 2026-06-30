import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Integration() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("client_default");
  const [activeTab, setActiveTab] = useState<"html" | "react" | "wordpress">("html");

  const tenantId = user?.tenantId || "SEU_TENANT_ID";
  const displayApiKey = apiKey.trim() || "SUA_API_KEY";
  const displayClientId = clientId.trim() || "SEU_CLIENT_ID";

  const htmlSnippet = `<!-- 1. Importe o script do AltChat -->
<script src="https://cdn.altchat.io/v1/altchat.js"></script>

<!-- 2. Adicione o Web Component onde desejar que o chat seja ancorado -->
<altchat-widget 
  tenant-id="${tenantId}" 
  client-id="${displayClientId}" 
  api-key="${displayApiKey}"
></altchat-widget>`;

  const reactSnippet = `// 1. Instale o pacote oficial do protocolo:
// npm install @altchat/client

// 2. Importe o SDK no arquivo de entrada da sua aplicação (ex: main.tsx ou App.tsx)
import "@altchat/client";

// 3. (Opcional, para TypeScript) Adicione a tipagem global do Web Component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'altchat-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'tenant-id'?: string;
        'client-id'?: string;
        'api-key'?: string;
      }, HTMLElement>;
    }
  }
}

// 4. Utilize o componente nativamente no seu JSX
export function App() {
  return (
    <div>
      <h1>Minha Aplicação React</h1>
      
      <altchat-widget 
        tenant-id="${tenantId}" 
        client-id="${displayClientId}" 
        api-key="${displayApiKey}"
      ></altchat-widget>
    </div>
  );
}`;

  const wordpressSnippet = `<!-- Passo a Passo para o WordPress: -->

1. No seu Painel do WordPress, vá em "Aparência" > "Editor de Arquivos de Tema"
   (ou instale um plugin como "WPCode" ou "Insert Headers and Footers").

2. Edite o arquivo "header.php" do seu tema ativo e cole o código abaixo
   imediatamente antes da tag de fechamento </head>:

<script src="https://cdn.altchat.io/v1/altchat.js"></script>

3. Edite o arquivo "footer.php" ou use as configurações do mesmo plugin
   para colar o elemento visual logo antes do fechamento </body>:

<altchat-widget 
  tenant-id="${tenantId}" 
  client-id="${displayClientId}" 
  api-key="${displayApiKey}"
></altchat-widget>

4. Salve as alterações. O Widget carregará automaticamente no site.`;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Guia de Integração</h1>
        <p>Aprenda como injetar o AltChat no seu site e acompanhe os códigos com as variáveis do seu Tenant já inseridas.</p>
      </header>

      <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#111827" }}>Configuração das Credenciais</h3>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "1rem" }}>
          Como sua <strong>API Key</strong> não fica salva de forma legível no banco de dados (por segurança), você precisa colar uma chave válida recém-criada abaixo para que os códigos de integração sejam preenchidos automaticamente.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>Sua API Key (Gerada em Server Debug):</label>
            <input 
              type="text" 
              placeholder="Cole sua chave gerada..."
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#374151", marginBottom: "4px" }}>ID do Cliente (Widget):</label>
            <input 
              type="text" 
              value={clientId} 
              onChange={(e) => setClientId(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button 
          onClick={() => setActiveTab("html")}
          style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: activeTab === "html" ? "#2563eb" : "#e5e7eb", color: activeTab === "html" ? "#fff" : "#374151", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          HTML / JS Puro
        </button>
        <button 
          onClick={() => setActiveTab("react")}
          style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: activeTab === "react" ? "#2563eb" : "#e5e7eb", color: activeTab === "react" ? "#fff" : "#374151", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          React / Next.js
        </button>
        <button 
          onClick={() => setActiveTab("wordpress")}
          style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: activeTab === "wordpress" ? "#2563eb" : "#e5e7eb", color: activeTab === "wordpress" ? "#fff" : "#374151", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          WordPress
        </button>
      </div>

      <div style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "1rem", borderRadius: "8px", overflowX: "auto" }}>
        <pre style={{ margin: 0, fontSize: "14px", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {activeTab === "html" && htmlSnippet}
          {activeTab === "react" && reactSnippet}
          {activeTab === "wordpress" && wordpressSnippet}
        </pre>
      </div>
    </div>
  );
}
