# AltChat V1 MVP — Próximos Passos

> **Status atual:** Sprints 1, 2 e 3 concluídos.
> **Restante:** 4 blocos de trabalho para MVP funcional.

---

## ✅ Já Concluído

| Sprint | Entrega | Status |
|--------|---------|--------|
| Sprint 1 | Monorepo (npm workspaces + Turborepo) | ✅ |
| Sprint 1 | Pacote `@altchat/protocol` (tipos ACPP/AIP) | ✅ |
| Sprint 1 | Prisma schema definido (`prisma/schema.prisma`) | ✅ |
| Sprint 1 | Configuração de ambiente (`.env`) | ✅ |
| Sprint 2 | Renderização dos 8 comandos AIP no client | ✅ |
| Sprint 2 | Tema dinâmico ACPP via CSS Variables | ✅ |
| Sprint 2 | Ciclo de vida de sessão (persist + timeout) | ✅ |
| Sprint 2 | Simulação de upload de arquivo (Base64 local) | ✅ |
| Sprint 3 | Autenticação por API Key (`X-AltChat-Api-Key`) | ✅ |
| Sprint 3 | Isolamento multi-tenant (middleware) | ✅ |
| Sprint 3 | Rate limiting (100 req/min por key) | ✅ |
| Sprint 3 | Audit logs in-memory | ✅ |

---

## 🔲 Sprint 4 — Migração para PostgreSQL + Prisma

> **Objetivo:** Sair do armazenamento in-memory e persistir dados reais.

- [x] **4.1** Criar `docker-compose.yml` com PostgreSQL 16 + MinIO
- [x] **4.2** Rodar `npx prisma migrate dev --name init` para gerar as tabelas
- [x] **4.3** Criar seed script (`prisma/seed.ts`) com tenant demo + API Key + client config
- [x] **4.4** Refatorar `apps/api/src/store.ts` → substituir arrays in-memory por chamadas Prisma
  - [x] 4.4.1 Migrar `sessions` → `prisma.session`
  - [x] 4.4.2 Migrar `events` → `prisma.event`
  - [x] 4.4.3 Migrar `apiKeys` → `prisma.apiKey`
  - [x] 4.4.4 Migrar `auditLogs` → `prisma.auditLog` (requer criação do model)
  - [x] 4.4.5 Migrar `tenants` → `prisma.tenant`
  - [x] 4.4.6 Migrar `presentationConfig` → `prisma.clientConfig`
- [x] **4.5** Atualizar middlewares para usar Prisma (auth, tenantFilter)
- [x] **4.6** Atualizar `server.ts` com as queries Prisma
- [x] **4.7** Testar persistência: parar servidor, reiniciar, verificar dados mantidos
- [x] **4.8** Validar build (`npm run build`)

---

## 🔲 Sprint 5 — Console Admin: Dashboard

> **Objetivo:** Tela de Dashboard com KPIs + manter painéis JSON de debug.

- [x] **5.1** Criar rota `GET /api/admin/stats` no backend retornando:
  - Sessões abertas / fechadas
  - Total de eventos
  - Eventos por hora (últimas 24h)
  - API Keys ativas
- [x] **5.2** Criar componente `Dashboard.tsx` no console com cards de KPIs
- [x] **5.3** Adicionar navegação por abas: Dashboard | Client Demo | Server Debug
- [x] **5.4** Manter o `ServerConsole.tsx` existente como aba "Server Debug"
- [x] **5.5** Validar build (`npm run build`)

---

## 🔲 Sprint 6 — SDK Embutível (`altchat.js`)

> **Objetivo:** Criar Web Component isolado que pode ser embarcado em qualquer site.

- [x] **6.1** Criar pacote `packages/client/` com Vite configurado para output UMD/IIFE
- [x] **6.2** Implementar `<altchat-widget>` Web Component com Shadow DOM
  - [x] 6.2.1 Encapsular CSS do widget no Shadow DOM (sem conflitos com site host)
  - [x] 6.2.2 Aceitar atributos: `tenant-id`, `client-id`, `endpoint`, `api-key`
  - [x] 6.2.3 Renderizar o widget de chat dentro do Shadow DOM
  - [x] 6.2.4 Implementar método `AltChat.init({ tenantId, clientId, endpoint, apiKey })`
- [x] **6.3** Criar botão flutuante (FAB) para abrir/fechar o widget no canto da tela
- [x] **6.4** Criar `apps/demo/` — página HTML simples que carrega o `altchat.js`
- [x] **6.5** Build e testar: `<script src="altchat.js">` funciona em página HTML pura
- [x] **6.6** Validar build (`npm run build`)

---

## 🔲 Sprint 7 — Docker Compose + Finalização

> **Objetivo:** Empacotar tudo para deploy e testar end-to-end.

- [x] **7.1** Criar `Dockerfile` para `apps/api`
- [x] **7.2** Criar `Dockerfile` para `apps/console`
- [x] **7.3** Atualizar `docker-compose.yml` com serviços: postgres, minio, api, console
- [x] **7.4** Testar `docker-compose up` do zero (banco limpo → seed → operação normal)
- [x] **7.5** Documentar URLs de acesso (API, Console, MinIO)
- [x] **7.6** Teste E2E manual completo:
  - [x] 7.6.1 Embutir widget em página HTML de demo
  - [x] 7.6.2 Iniciar sessão e percorrer fluxo completo
  - [x] 7.6.3 Verificar dados persistidos no PostgreSQL
  - [x] 7.6.4 Verificar Dashboard com KPIs
  - [x] 7.6.5 Testar API Key inválida → 401
  - [x] 7.6.6 Testar acesso cross-tenant → 403
- [x] **7.7** Atualizar `README.md` com instruções de instalação e uso

---

## 📊 Resumo de Progresso

```
Sprint 1  ████████████████████  100%  Fundação
Sprint 2  ████████████████████  100%  Client MVP
Sprint 3  ████████████████████  100%  Segurança
Sprint 4  ████████████████████  100%  PostgreSQL/Prisma
Sprint 5  ████████████████████  100%  Console Dashboard
Sprint 6  ████████████████████  100%  SDK Embutível
Sprint 7  ████████████████████  100%  Docker + E2E
```

---

## 🎯 Critérios de Aceite do MVP

Um **cliente piloto** consegue:

1. ✅ Embutir `<script src="altchat.js">` no site e o widget aparece
2. ✅ Iniciar sessão sem erros
3. ✅ Interagir com inputs, botões e formulários
4. ✅ Dados persistem no PostgreSQL após restart do servidor
5. ✅ Autenticação por API Key funciona
6. ✅ Dashboard mostra KPIs básicos
7. ✅ `docker-compose up` sobe tudo do zero
