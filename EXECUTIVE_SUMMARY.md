# AltChat V1 MVP - Sumário Executivo

**Versão:** 1.0  
**Data:** 2024  
**Status:** Pronto para Implementação  

---

## O que é AltChat?

AltChat é um **framework de conversação Client/Server** que permite empresas embutir um assistente conversacional em seus websites com:

- ✅ Mensagens simples
- ✅ Campos de entrada (text, email, CPF, etc)
- ✅ Botões e formulários
- ✅ Upload de arquivos
- ✅ Tema customizável (cores, logos, comportamento)
- ✅ Sessões persistidas (mesmo após refresh)
- ✅ Suporte multi-tenant

**Diferencial:** O servidor decide o fluxo completo; o client apenas executa instruções.

---

## Estrutura do Projeto

### 📦 Monorepo com 3 Apps + 4 Packages

```
altchat/
├── apps/
│   ├── api/           # Backend REST API (Node.js/Express)
│   ├── console/       # Admin Web (React)
│   └── demo/          # App de demonstração
├── packages/
│   ├── client/        # SDK JavaScript (web component)
│   ├── react/         # SDK React (hook)
│   ├── protocol/      # Tipos compartilhados (TypeScript)
│   └── ui/            # Componentes visuais reutilizáveis
└── prisma/            # Schema + migrations
```

---

## Dois Protocolos Principais

### 🎨 ACPP (Apresentação)
Define como o client se parece:
- Título, avatar, logo
- Modo de janela (popup, embedded, fullscreen)
- Tema (cores, fonte, modo claro/escuro)
- Comportamento (auto-open, persistência de sessão)

### 💬 AIP (Interação)
Define o que o client pode fazer:
- `show_message` - Mensagem do servidor
- `request_input` - Campo de entrada
- `show_buttons` - Botões de escolha
- `show_form` - Formulário multi-campo
- `upload_file` - Solicitar arquivo
- `wait` - Indicador de processamento
- `redirect` - Abrir URL
- `clear` / `close` - Limpar ou encerrar

---

## Arquitetura em 3 Camadas

```
┌─ FRONTEND ─────────────────┐
│ Client Widget (React)      │ ← Renderiza comandos AIP
│ Aplica tema ACPP           │ ← Estilo customizável
│ Gerencia session           │ ← Persistência
└─────────────────────────────┘
           ↕ HTTP REST API
┌─ BACKEND ──────────────────┐
│ Express REST endpoints      │ ← Cria/gerencia sessões
│ Processa eventos           │ ← Recebe ações do user
│ Executa lógica business    │ ← Flow engine / state machine
│ Auditoria & Segurança      │ ← Multi-tenant isolation
└─────────────────────────────┘
           ↕ SQL
┌─ DATABASE ─────────────────┐
│ PostgreSQL                 │ ← Sessions, events, config
│ MinIO (S3 compatible)      │ ← Arquivos
└─────────────────────────────┘
```

---

## Stack Recomendada

| Camada | Tecnologia | Alternativa |
|--------|-----------|------------|
| **Backend** | Node.js 20 + Express | Django, FastAPI, Go |
| **Frontend** | React 18 + Vite | Vue 3, Svelte |
| **Banco** | PostgreSQL | MySQL, MariaDB |
| **ORM** | Prisma | TypeORM, SQLAlchemy |
| **Storage** | MinIO (local) / S3 | Google Cloud Storage, Azure Blob |
| **Deploy** | Docker Compose (MVP) | Kubernetes, Heroku |

---

## Timeline: 12 Semanas para MVP

```
┌─ SPRINT 1 (Wk 1-2) ──────────────────────┐
│ ✅ Monorepo setup                        │
│ ✅ Prisma + PostgreSQL                   │
│ ✅ TypeScript protocol package           │
│ ✅ Environment config                    │
└──────────────────────────────────────────┘

┌─ SPRINT 2 (Wk 3-4) ──────────────────────┐
│ ✅ Client Web Component                  │
│ ✅ Render 8 comandos AIP                 │
│ ✅ Apply ACPP theme                      │
│ ✅ Session lifecycle                     │
└──────────────────────────────────────────┘

┌─ SPRINT 3 (Wk 5-6) ──────────────────────┐
│ ✅ API Key authentication                │
│ ✅ Multi-tenant filtering                │
│ ✅ Rate limiting                         │
│ ✅ Audit logging                         │
└──────────────────────────────────────────┘

┌─ SPRINT 4 (Wk 7-9) ──────────────────────┐
│ ✅ Admin Console (5 telas)               │
│ ✅ Dashboard, Sessions, Events           │
│ ✅ API Keys management                   │
│ ✅ Test console                          │
└──────────────────────────────────────────┘

┌─ SPRINT 5 (Wk 10-11) ────────────────────┐
│ ✅ Embeddable SDK (altchat.js)           │
│ ✅ Docker Compose setup                  │
│ ✅ Production-ready checklist             │
└──────────────────────────────────────────┘

┌─ SPRINT 6 (Wk 12) ───────────────────────┐
│ ✅ Testing & QA                          │
│ ✅ Cliente piloto                        │
│ ✅ Deploy para staging                   │
└──────────────────────────────────────────┘
```

---

## Fluxo Operacional (Simplificado)

```
1️⃣ Empresa copia script para seu site:
   <script src="https://cdn.altchat.io/altchat.js"></script>
   <script>AltChat.init({tenantId, clientId, endpoint})</script>

2️⃣ Widget carrega, aplica tema (ACPP) e cria sessão no servidor

3️⃣ Servidor envia comando inicial (AIP):
   {action: "show_message", text: "Olá! Como posso ajudar?"}

4️⃣ Cliente renderiza mensagem + botões

5️⃣ Usuário clica botão → cliente envia evento

6️⃣ Servidor processa evento → executa lógica → retorna novo comando

7️⃣ Loop repeats até sessão encerrar

8️⃣ Dados salvos no banco (PostgreSQL) para análise/auditoria
```

---

## 6 Entidades de Banco de Dados

| Tabela | Propósito | Exemplo de Uso |
|--------|----------|-----------------|
| **Tenant** | Clientes/Empresas | "Empresa X" |
| **Client** | Instâncias por tenant | "Widget de suporte", "Chat de vendas" |
| **Session** | Conversas únicas | Uma conversa com user_123 |
| **Event** | Ações do usuário | Clique em botão, envio de formulário |
| **Command** | Instruções ao client | "Mostrar mensagem", "Solicitar email" |
| **ApiKey** | Autenticação | Chave de produção para integração |

*+ 5 tabelas adicionais: ClientConfig, Attachment, Webhook, AuditLog, Message*

---

## 4 Tipos de Campo Suportados

```javascript
// Texto simples
{type: "text", label: "Nome", required: true}

// Especializado (com validação/máscara)
{type: "email", label: "Email"}
{type: "cpf", label: "CPF", mask: "###.###.###-##"}
{type: "phone", label: "Telefone"}

// Longa
{type: "textarea", label: "Mensagem"}

// Seleção
{type: "select", label: "Estado", options: [{label: "SP", value: "sp"}]}
{type: "radio", label: "Gênero", options: [...]}
{type: "checkbox", label: "Concordo", options: [...]}

// Especiais
{type: "date", label: "Data"}
{type: "datetime", label: "Data e Hora"}
{type: "number", label: "Quantidade"}
{type: "file", label: "Anexar documento"}
```

---

## Segurança & Compliance

### Autenticação
- **API Key** (server-to-server) obrigatória em toda request
- **JWT** opcional para console admin

### Isolamento Multi-tenant
- Dados de empresa A **nunca** vazam para empresa B
- Filtro por `tenant_id` em 100% das queries
- Validação em middleware

### Rate Limiting
- 100 requisições por minuto por API Key
- Proteção contra DoS

### Auditoria
- Registro de todas as ações administrativas
- Retenção de 1 ano

### LGPD/Privacy
- Sessions expiram em 180 dias
- Eventos expiram em 90 dias
- Possibilidade de exclusão de dados

---

## Custos Operacionais (Estimado)

### MVP Local (Docker Compose)
- **Servidor:** 1x vCPU, 2GB RAM (~$10/mês)
- **Banco:** PostgreSQL gerenciado (~$15/mês)
- **Storage:** MinIO local ou S3 (~$1-5/mês)
- **Total:** ~$30/mês

### Escala (100+ clientes)
- **Load Balancer:** $50/mês
- **Kubernetes:** $100-200/mês
- **PostgreSQL Managed:** $100-300/mês
- **S3 Storage:** $5-50/mês (conforme uso)
- **Total:** ~$300-600/mês

---

## Dependências Externas

### Mínimas (MVP)
- PostgreSQL (local ou gerenciado)
- Node.js 20+ runtime
- npm/yarn package manager

### Recomendadas (Produção)
- S3 ou MinIO (storage de arquivos)
- Redis (cache, sessões)
- SSL/TLS (HTTPS obrigatório)

### Opcionais (Futuro)
- SendGrid (emails)
- Twilio (SMS)
- OpenAI API (IA)

---

## Métricas de Sucesso (MVP)

| Métrica | Meta |
|---------|------|
| **Uptime** | 99% |
| **Latência (p50)** | <100ms |
| **Latência (p95)** | <500ms |
| **Erros** | <0.1% |
| **Time to Load Client** | <2s |
| **Sessions/segundo** | 100+ |
| **API Calls/minuto** | 1000+ |

---

## Próximas Versões (Roadmap)

### ✅ V1 MVP (12 semanas)
- Protocolos ACPP + AIP congelados
- 8 comandos essenciais
- Admin console básico
- SDK embutível simples
- Multi-tenant isolado

### 🔄 V2 (Meses 4-6)
- Designer visual de fluxos (drag-and-drop)
- SDK React oficial
- Temas avançados (CSS customizável)
- Integração com CRM (Salesforce, HubSpot)
- Billing / Monetização

### 🚀 V3+ (Meses 7-12)
- IA/NLP para routing automático
- Webhooks para sistemas externos
- Analytics avançado (funnel, heatmaps)
- Suporte multicanal (WhatsApp, SMS, Telegram)
- Marketplace de integrações

---

## Documentação Completa

Esta pasta contém **4 documentos detalhados**:

1. **API Specification** (50+ endpoints)
   - REST API contracts
   - Auth & Rate Limiting
   - Error handling

2. **Database Specification**
   - Schema PostgreSQL completo
   - Prisma ORM
   - Índices & Performance

3. **Protocol Specification**
   - ACPP (visual config)
   - AIP (8 comandos)
   - Event types & versionamento

4. **Implementation Guide**
   - Stack recomendada
   - 5 sprints detalhados
   - Docker Compose
   - Checklist de MVP

**+ README.md** com índice e guia de leitura  
**+ Este documento** (sumário executivo)

---

## Para Começar

### Developers
```bash
# 1. Ler documentação
cat 04_IMPLEMENTATION_GUIDE.md

# 2. Setup local
docker-compose up -d

# 3. Criar databases
npx prisma migrate dev --name init

# 4. Iniciar dev server
npm run dev
```

### Tech Leads / Managers
```
1. Revisar 04_IMPLEMENTATION_GUIDE.md (visão geral)
2. Ler 02_DATABASE_SPECIFICATION.md (arquitetura)
3. Revisar timeline (12 semanas)
4. Planejar alocação de recursos
5. Kickoff do projeto
```

### Clientes / Product Managers
```
1. Entender fluxo operacional (seção acima)
2. Revisar roadmap (V1 → V2 → V3)
3. Alinhar expectativas com V1 MVP
4. Preparar cliente piloto
5. Listar requerimentos específicos do domínio
```

---

## Perguntas Comuns

### P: Quanto tempo leva para MVP?
**R:** ~12 semanas com equipe de 3-4 developers.

### P: Posso customizar o fluxo/lógica?
**R:** Sim! O servidor decide 100% da lógica. ACPP e AIP são flexíveis.

### P: Qual é o custo mensal?
**R:** MVP local ~$30/mês. Escala production ~$300-600/mês.

### P: Suporta integração com meu CRM?
**R:** V1 não. V2 inclui webhooks + integrações oficiais.

### P: E se meu domínio precisar de comandos customizados?
**R:** Adicione novo tipo em AIP v1.1 (backwards-compatible).

### P: Pode rodar on-premises?
**R:** Sim! Docker Compose funciona em qualquer servidor Linux.

### P: Qual é o SLA?
**R:** MVP não tem SLA. V2 inclui suporte 24/7 e garantia de uptime.

---

## Decisões Arquiteturais Chave

| Decisão | Motivo |
|---------|--------|
| **Node.js + Express** | Rápido setup, grande comunidade, JavaScript full-stack |
| **PostgreSQL** | Robusto, confiável, suporta JSONB para flexibilidade |
| **Prisma ORM** | Type-safe, migrações automáticas, developer experience |
| **React** | Dominante no mercado, curva de aprendizado baixa |
| **TypeScript** | Evita bugs, melhor tooling, documentação automática |
| **Docker** | Ambiente consistente local ↔ produção |
| **REST (não GraphQL)** | Simplicidade, cache HTTP, segurança |
| **Dual Protocol (ACPP+AIP)** | Separação de concerns, flexibilidade |

---

## Próximo Passo

**Escolha sua trilha:**

- **Você é Developer?** → Leia `04_IMPLEMENTATION_GUIDE.md` + escolha seu path (backend/frontend)
- **Você é Tech Lead?** → Leia tudo na ordem do README
- **Você é Manager?** → Leia este sumário + timeline em `04_IMPLEMENTATION_GUIDE.md`
- **Você é C-level?** → Este documento é suficiente; delegue técnico

---

**AltChat V1 MVP**  
*Pronto para você começar a codificar* ✅

Data: 2024  
Versão: 1.0  
Status: Congelado para desenvolvimento
