import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4300/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro de rede ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f3f4f6" }}>
      <div style={{ width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#111827" }}>AltChat Admin</h2>
        
        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "14px", fontWeight: 500 }}>E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
              placeholder="admin@altchat.io"
            />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontSize: "14px", fontWeight: 500 }}>Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
              placeholder="******"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              backgroundColor: "#2563eb", 
              color: "#fff", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
