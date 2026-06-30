# AltChat — Próximos Passos

> **Data:** 30/06/2026  
> **Baseline:** MVP V1 concluído (Sprints 1–7) + Features pós-MVP (FlowEditor visual, JWT Auth, Login Admin)  
> **Foco atual:** Consolidação, estabilização e qualidade antes de novas features

---

## 📋 Resumo Executivo

O MVP V1 do AltChat foi totalmente implementado e já conta com funcionalidades que vão além do escopo original (designer visual de fluxos, autenticação JWT, login administrativo). O próximo ciclo de trabalho foca em **consolidar a base existente** — testes automatizados, CI/CD, polimento de UX, segurança, performance e documentação — antes de avançar para as features V2/V3.

---

## 🎯 Fase 1 — Consolidação & Estabilização

### 1. Testes Automatizados

> **Prioridade:** 🔴 Alta  
> **Framework:** Vitest (unit/integração) + Playwright (E2E)

#### 1.1 Testes Unitários (`packages/protocol`)
- [x] Validação dos schemas Zod dos protocolos ACPP e AIP
- [x] Testes de serialização/deserialização dos tipos compartilhados
- [x] Testes de edge cases (payloads inválidos, campos faltantes)

#### 1.2 Testes de Integração (`apps/api`)
- [ ] **Autenticação:** Validação de API Key (válida, inválida, revogada, expirada)
- [ ] **Multi-tenant:** Isolamento entre tenants (acesso cruzado → 403)
- [ ] **Rate Limiting:** Limite de 100 req/min aplicado corretamente
- [ ] **Sessões:** Criação, persistência, timeout, fechamento
- [ ] **Eventos:** Ciclo completo de eventos AIP (message, input, button, form, upload)
- [ ] **Flow Engine:** Fluxo hardcoded vs. fluxo dinâmico (do FlowEditor)
- [ ] **Dynamic Flow Engine:** Navegação por nós, tratamento de edges, fallbacks
- [ ] **Admin Routes:** Stats, audit logs, API keys CRUD, flow CRUD
- [ ] **JWT Auth:** Login, token válido, token expirado, roles (ADMIN, OPERATOR, VIEWER)
- [ ] **Audit Logs:** Registro correto de ações administrativas

#### 1.3 Testes de Componentes (`apps/console`)
- [ ] Dashboard: renderização de KPIs, carregamento de dados
- [ ] FlowEditor: criação/edição/salvamento de nós e edges
- [ ] ServerConsole: exibição de sessões, eventos, comandos
- [ ] Login: fluxo de autenticação, validação de campos
- [ ] Integration: exibição do snippet de integração

#### 1.4 Testes do Widget (`packages/client`)
- [ ] Renderização do Web Component (`<altchat-widget>`)
- [ ] Shadow DOM: isolamento de CSS confirmado
- [ ] Atributos: `tenant-id`, `client-id`, `api-key`, `endpoint`
- [ ] Renderização dos 8 comandos AIP
- [ ] Persistência de sessão (localStorage)

#### 1.5 Testes E2E (Playwright)
- [ ] **Fluxo completo do widget:** Abrir → iniciar sessão → interagir com todos os comandos → fechar
- [ ] **Console Admin:** Login → Dashboard → Fluxos → Integração → Server Debug
- [ ] **FlowEditor E2E:** Criar fluxo → adicionar nós → conectar → salvar → verificar no widget
- [ ] **Multi-browser:** Chromium, Firefox, WebKit
- [ ] **Responsividade:** Desktop e mobile viewports

#### 1.6 Configuração de Testes
- [ ] Configurar `vitest.config.ts` na raiz e por workspace
- [ ] Configurar `playwright.config.ts` com Docker Compose para ambiente de teste
- [ ] Criar fixtures/factories para dados de teste (tenants, sessions, events)
- [ ] Configurar test database separado (PostgreSQL de teste)
- [ ] Adicionar scripts no `package.json` raiz: `test`, `test:unit`, `test:integration`, `test:e2e`
- [ ] Configurar coverage report (Istanbul/V8)
- [ ] Meta de cobertura: **80%+** para API, **70%+** para Console

---

### 2. CI/CD Pipeline (GitHub Actions)

> **Prioridade:** 🔴 Alta  
> **Deploy:** Docker Compose local (sem cloud por enquanto)

#### 2.1 Workflow de CI (Pull Requests)
- [ ] **Lint & Format:** ESLint + Prettier check em todos os workspaces
- [ ] **Type Check:** `tsc --noEmit` em todos os workspaces TypeScript
- [ ] **Testes Unitários:** `vitest run` em `packages/protocol` e `apps/api`
- [ ] **Testes de Integração:** Subir PostgreSQL via `services`, rodar migrations + seed, executar testes
- [ ] **Testes E2E:** Subir stack completa via Docker Compose, rodar Playwright
- [ ] **Build Check:** `turbo run build` para garantir que todos os pacotes compilam
- [ ] **Security Scan:** Integrar Snyk para análise de vulnerabilidades

#### 2.2 Workflow de CD (Branch `main`)
- [ ] Build de imagens Docker (API + Console)
- [ ] Push para GitHub Container Registry (GHCR)
- [ ] Tag automática com versão semântica
- [ ] Gerar changelog automatizado (conventional commits)

#### 2.3 Workflows Auxiliares
- [ ] **Dependabot:** Atualização automática de dependências com PR review
- [ ] **Prisma Migration Check:** Detectar changes no schema que precisam de migration
- [ ] **Label automático:** Classificar PRs por workspace afetado (api, console, client, protocol)

#### 2.4 Configuração
- [ ] Criar `.github/workflows/ci.yml`
- [ ] Criar `.github/workflows/cd.yml`
- [ ] Criar `.github/dependabot.yml`
- [ ] Configurar secrets: `DATABASE_URL`, `JWT_SECRET`, `GHCR_TOKEN`
- [ ] Definir branch protection rules para `main`

---

### 3. Polimento de UX — Console Admin

> **Prioridade:** 🟡 Média

- [ ] **Design System:** Extrair tokens de cor, tipografia e espaçamento para CSS variables
- [ ] **Responsividade:** Sidebar colapsável em telas menores, layout adaptativo
- [ ] **Dark Mode:** Alternar entre tema claro e escuro
- [ ] **Loading States:** Skeletons/shimmer em vez de texto "Carregando..."
- [ ] **Empty States:** Ilustrações e mensagens quando não há dados
- [ ] **Toast Notifications:** Sistema unificado de feedback (sucesso, erro, warning)
- [ ] **Breadcrumbs:** Navegação contextual nas sub-páginas
- [ ] **Paginação:** Tabelas com paginação server-side (sessões, eventos, audit logs)
- [ ] **Filtros & Busca:** Filtrar sessões por status, período, client; busca em eventos
- [ ] **Acessibilidade (a11y):** Labels ARIA, navegação por teclado, contraste mínimo WCAG AA
- [ ] **Internacionalização (i18n):** Preparar estrutura para PT-BR e EN (futuro)

---

### 4. Polimento de UX — Widget/Client

> **Prioridade:** 🟡 Média

- [ ] **Animações:** Transições suaves para abertura/fechamento do widget, aparição de mensagens
- [ ] **Mobile UX:** Widget responsivo, modo fullscreen em mobile
- [ ] **Typing Indicator:** Animação de "digitando..." mais refinada
- [ ] **Scroll Behavior:** Auto-scroll inteligente para novas mensagens, botão "voltar ao fim"
- [ ] **Acessibilidade:** Roles ARIA para chat, anúncio de novas mensagens para screen readers
- [ ] **Temas:** Suporte a dark mode no widget via ACPP
- [ ] **Offline/Error States:** Tratamento gracioso de desconexão, retry automático
- [ ] **Sound Notifications:** Notificação sonora opcional para novas mensagens
- [ ] **Badge Counter:** Indicador de mensagens não lidas no FAB

---

### 5. Segurança & Hardening

> **Prioridade:** 🟡 Média

- [ ] **CORS Restritivo:** Configurar origins permitidas por tenant (não wildcard)
- [ ] **HTTPS Enforcement:** Redirecionar HTTP → HTTPS em produção
- [ ] **Helmet Refinado:** Configurar CSP (Content Security Policy) específico
- [ ] **Input Sanitization:** Sanitizar HTML/XSS em todas as entradas do usuário
- [ ] **SQL Injection:** Audit de todas as queries Prisma (uso de raw queries)
- [ ] **Rate Limiting por IP:** Adicionar rate limit por IP além de por API Key
- [ ] **JWT Refresh Tokens:** Implementar refresh token rotation
- [ ] **Password Policy:** Validação de força de senha no cadastro de usuários
- [ ] **Secrets Management:** Remover `.env` do versionamento, usar `.env.example` como template
- [ ] **API Key Rotation:** Workflow para rotacionar keys sem downtime
- [ ] **Session Timeout:** Timeout configurável por tenant (não hardcoded)
- [ ] **Snyk Integration:** Scan contínuo de vulnerabilidades em dependências

---

### 6. Performance & Observabilidade

> **Prioridade:** 🟢 Baixa (para MVP, mas essencial pré-produção)

- [ ] **Logging Estruturado:** Migrar `console.log/error` para logger estruturado (ex: Pino)
- [ ] **Request ID:** Adicionar `X-Request-Id` para rastreamento de requisições
- [ ] **Health Check Avançado:** `/health` verificar conexão com DB, MinIO, memória
- [ ] **Métricas de API:** Tempo de resposta, contagem de erros, throughput
- [ ] **Connection Pooling:** Configurar pool do Prisma para alta concorrência
- [ ] **Query Optimization:** Analisar queries lentas, adicionar índices necessários
- [ ] **Caching:** Implementar cache para `getClientConfig` e `getFlowByClientId` (Redis ou in-memory)
- [ ] **Bundle Size:** Auditar e otimizar tamanho do `altchat.js` (target: < 100KB gzipped)
- [ ] **Lazy Loading:** Code splitting no Console Admin por rota

---

### 7. Documentação Técnica

> **Prioridade:** 🟢 Baixa

- [ ] **API Reference (Swagger/OpenAPI):** Gerar documentação interativa das rotas REST
- [ ] **Guia de Contribuição:** `CONTRIBUTING.md` com setup local, padrões de código, processo de PR
- [ ] **Guia de Integração:** Tutorial passo-a-passo para integrar `altchat.js` em um site
- [ ] **Documentação do FlowEditor:** Como criar fluxos visuais, tipos de nós disponíveis
- [ ] **ADRs (Architecture Decision Records):** Documentar decisões técnicas importantes
- [ ] **Changelog:** Manter `CHANGELOG.md` com histórico de versões
- [ ] **JSDoc/TSDoc:** Documentar funções públicas da API e do SDK

---

### 8. Bug Fixes & Débitos Técnicos

> **Prioridade:** 🟡 Média

- [ ] **Upload de Arquivos:** Migrar simulação Base64 → upload real para MinIO/S3
- [ ] **Error Handling:** Tratamento de erros padronizado em toda a API (error codes, mensagens)
- [ ] **Validação Zod Unificada:** Centralizar schemas de validação no `packages/protocol`
- [ ] **Type Safety:** Eliminar usos de `any` no codebase (FlowEditor, server.ts, store.ts)
- [ ] **Environment Variables:** Validar todas as env vars na inicialização (fail fast)
- [ ] **Graceful Shutdown:** Implementar shutdown limpo da API (fechar connections, drain requests)
- [ ] **CORS Multi-origin:** Suportar múltiplas origins no CORS (atualmente hardcoded para uma)
- [ ] **Prisma Client Singleton:** Garantir que há apenas uma instância do PrismaClient

---

## 🚀 Fase 2 — Roadmap V2 (Features Futuras)

> **Pré-requisito:** Fase 1 de consolidação com cobertura de testes ≥ 70% e CI/CD funcional

### SDK React Oficial (`@altchat/react`)
- Hooks: `useAltChat()`, `useSession()`, `useCommands()`
- Componentes React nativos como alternativa ao Web Component
- Suporte a SSR (Next.js)
- Publicação no npm

### Designer Visual de Fluxos (Aprimoramentos)
- Undo/Redo no editor
- Templates de fluxo pré-prontos
- Validação visual de fluxos (nós desconectados, loops infinitos)
- Preview inline do fluxo sendo editado
- Exportar/importar fluxos como JSON

### Integração com IA / LLMs
- Conector para OpenAI, Gemini, Claude
- Nó de "IA" no FlowEditor para respostas dinâmicas
- Fallback de IA quando o usuário sai do roteiro pré-definido
- Configuração de prompts por tenant

### Storage Real (MinIO / S3)
- Upload real de arquivos com streaming
- URLs assinadas temporárias para visualização
- Gestão de attachments no Console Admin
- Limites de tamanho configuráveis por tenant

### Dashboard Avançado
- Gráficos de séries temporais (sessões, eventos por hora/dia)
- Funil de conversão por fluxo
- Exportação de dados (CSV, Excel)
- Filtros avançados por período, client, status

---

## 🔮 Fase 3 — Roadmap V3+ (Visão de Longo Prazo)

| Feature | Descrição |
|---------|-----------|
| **Suporte Multicanal** | Conectores para WhatsApp Business, Telegram, Facebook Messenger |
| **Billing & Monetização** | Planos, limites por tier, billing dashboard |
| **Marketplace de Integrações** | Plugins para CRM (Salesforce, HubSpot), ERPs, webhooks |
| **Analytics Avançado** | Heatmaps de interação, NPS pós-chat, sentiment analysis |
| **White-Label** | Customização completa da marca para revendedores |
| **WebSocket / Real-time** | Migrar de polling para WebSocket (chat em tempo real) |
| **Multi-idioma no Widget** | Internacionalização do widget para múltiplos idiomas |
| **API V2 (GraphQL)** | API GraphQL como alternativa ao REST |

---

## 📊 Ordem de Execução Recomendada

```
Fase 1.1  ▶  Testes Automatizados (Vitest + Playwright)     🔴 PRIORITÁRIO
Fase 1.2  ▶  CI/CD Pipeline (GitHub Actions)                 🔴 PRIORITÁRIO
Fase 1.8  ▶  Bug Fixes & Débitos Técnicos                    🟡 PARALELO
Fase 1.5  ▶  Segurança & Hardening                           🟡 SEQUENCIAL
Fase 1.3  ▶  Polimento UX — Console Admin                    🟡 SEQUENCIAL
Fase 1.4  ▶  Polimento UX — Widget/Client                    🟡 SEQUENCIAL
Fase 1.6  ▶  Performance & Observabilidade                   🟢 SEQUENCIAL
Fase 1.7  ▶  Documentação Técnica                            🟢 PARALELO
────────────────────────────────────────────────────────────
Fase 2    ▶  Features V2 (SDK React, IA, Storage, Dashboard)
Fase 3    ▶  Features V3+ (Multicanal, Billing, WebSocket)
```

---

## 🛠️ Stack de Ferramentas Definida

| Área | Ferramenta |
|------|-----------|
| **Testes Unit/Integração** | Vitest |
| **Testes E2E** | Playwright |
| **CI/CD** | GitHub Actions |
| **Container Registry** | GitHub Container Registry (GHCR) |
| **Deploy** | Docker Compose (local) |
| **Segurança** | Snyk (dependências) + Helmet (headers) |
| **Logging** | Pino (futuro) |

---

*Documento gerado em 30/06/2026. Atualizar conforme progresso.*
