# AltChat V1 MVP - Documentação Completa

**Versão:** 1.0  
**Data de Congelamento:** V1 MVP  
**Status:** Pronto para Desenvolvimento  

---

## 📚 Documentação Completa

Esta pasta contém a **especificação oficial do AltChat V1 MVP** convertida de Word para Markdown. Todos os arquivos são interdependentes e devem ser lidos em conjunto.

### Arquivos de Documentação

| Arquivo | Descrição | Para Quem |
|---------|-----------|-----------|
| **01_API_SPECIFICATION.md** | REST API endpoints, autenticação, erros | Developers Backend, Integrators |
| **02_DATABASE_SPECIFICATION.md** | Schema PostgreSQL, Prisma, índices | Database Architects, Backend Devs |
| **03_PROTOCOL_SPECIFICATION.md** | ACPP + AIP, comandos, eventos, tipos | Frontend Devs, Full-Stack |
| **04_IMPLEMENTATION_GUIDE.md** | Roadmap, stack, sprints, checklist | Tech Leads, Project Managers |

---

## 🚀 Quick Start (Docker)

A maneira mais fácil de rodar o projeto localmente é utilizando o Docker Compose. Isso levantará o banco de dados (PostgreSQL), o armazenamento de objetos (MinIO), o Backend (API) e o Frontend (Console).

1. Clone o repositório.
2. Na raiz do projeto, execute:
   ```bash
   docker-compose up -d --build
   ```
3. Aguarde alguns segundos para os containers subirem e a migração inicial/seed acontecer.
4. Acesse:
   - **Console Admin:** [http://localhost:8080](http://localhost:8080)
   - **API Base:** [http://localhost:4300](http://localhost:4300)
   - **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin`)

O Console já vem pré-configurado com uma sessão `Tenant Demo` e `API Key` válidos. Explore a aba **Dashboard** para ver as métricas e a aba **Client Demo** para testar o Chat!

---

## 📋 Estrutura de Cada Documento

### 01_API_SPECIFICATION.md

```
1. Padrão Geral
2. Health Check
3. Configuração do Client
4. Sessões (criar, obter, fechar)
5. Eventos (registrar e processar)
6. Uploads de Arquivos
7. Admin Console API
8. Gerenciar Chaves de API
9. Códigos de Erro Padronizados
10. OpenAPI Specification
11. Regras de Segurança
```

**Use quando:** Implementar backend REST, integrar com terceiros, configurar API Key.

---

### 02_DATABASE_SPECIFICATION.md

```
1. Objetivo
2. Banco Oficial (PostgreSQL)
3. Entidades Principais
4. DDL Sugerido (11 tabelas)
5. Índices Obrigatórios
6. Prisma Schema
7. Regras Multi-tenant
8. Retenção de Dados
9. Migração da POC para V1
10. Performance e Escalabilidade
11. Checklist de Setup
```

**Use quando:** Configurar banco, criar migrations, otimizar queries.

---

### 03_PROTOCOL_SPECIFICATION.md

```
1. Objetivo
2. Separação de Protocolos (ACPP vs AIP)
3. Envelope Padrão de Resposta
4. ACPP (Apresentação Visual)
5. AIP (Interação Conversacional)
   5.1 show_message
   5.2 request_input
   5.3 show_buttons
   5.4 show_form
   5.5 upload_file
   5.6 wait / 5.7 redirect / 5.8 clear / 5.9 close
6. Tipos de Campo (text, email, cpf, select, etc)
7. Eventos Client → Server
8. Versionamento e Compatibilidade
9. Regras de Compatibilidade
10. Fluxo Completo de Exemplo
11. Checklist de Implementação do Client
```

**Use quando:** Implementar frontend, entender fluxo conversacional, renderizar comandos.

---

### 04_IMPLEMENTATION_GUIDE.md

```
1. Objetivo
2. Stack Recomendada
3. Instalação Local
4. Estrutura de Projeto
5. Sprint 1: Fundação Técnica
6. Sprint 2: Client MVP
7. Sprint 3: API e Segurança
8. Sprint 4: Server Console
9. Sprint 5: SDK Embutível
10. Docker Compose MVP
11. Checklist de V1 MVP
12. Critérios de Aceite
13. Próximos Passos (V2, V3)
14. Resumo de Sprints
```

**Use quando:** Planejar desenvolvimento, gerenciar sprints, configurar ambiente local.

---

## 🏗️ Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │   AltChat Client (Web Component / React)         │   │
│  │  - Renderiza comandos AIP                        │   │
│  │  - Aplica tema ACPP                              │   │
│  │  - Envia eventos (user input)                    │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                          ↕ API (REST/JSON)
                    (X-AltChat-Api-Key header)
┌──────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  REST API (/api/v1)                              │   │
│  │  - POST /sessions (criar sessão)                 │   │
│  │  - POST /events (receber evento)                 │   │
│  │  - POST /attachments (upload arquivo)            │   │
│  │  - GET /config (obter ACPP)                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Admin Console API (/api/v1/admin)               │   │
│  │  - Sessions, Events, Clients, API Keys, Audit    │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────┐
│              Database & Storage                         │
│  ┌───────────────┬────────────┬──────────────────────┐## 🚀 Quick Start (Docker)

A maneira mais fácil de rodar o projeto localmente é utilizando o Docker Compose. Isso levantará o banco de dados (PostgreSQL), o armazenamento de objetos (MinIO), o Backend (API) e o Frontend (Console).

1. Clone o repositório.
2. Na raiz do projeto, execute:
   ```bash
   docker-compose up -d --build
   ```
3. Aguarde alguns segundos para os containers subirem e a migração inicial/seed acontecer.
4. Acesse:
   - **Console Admin:** [http://localhost:8080](http://localhost:8080)
   - **API Base:** [http://localhost:4300](http://localhost:4300)
   - **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin`)

O Console já vem pré-configurado com uma sessão `Tenant Demo` e `API Key` válidos. Explore a aba **Dashboard** para ver as métricas e a aba **Client Demo** para testar o Chat!

## 💻 Desenvolvimento Local (Sem Docker para os Apps)

Se preferir rodar os apps nativamente no Node.js (necessário para dev com hot-reload):                   │   │
│  │   config)     │            │                      │   │
│  └───────────────┴────────────┴──────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Conceitos-Chave

### Multi-tenant
- Cada requisição deve validar `tenant_id`
- Nenhum dado de um tenant vaza para outro
- API Key está vinculada a um tenant

### Protocolos Duais
- **ACPP:** Como o client se parece (visual, theme, window mode)
- **AIP:** O que o client faz (comandos, interações, fluxo)

### Fluxo Conversacional
```
1. Client carrega ACPP → Aplica tema
2. Client cria Session → Recebe sessionId
3. Server envia AIP Commands → Client renderiza
4. Usuário interage → Client envia Event
5. Server processa Event → Volta para passo 3
```

### Versionamento
- ACPP v1.0 e AIP v1.0 são **congeladas**
- Novos comandos em v1.1+ devem ser **opcionais**
- Clients antigos devem ignorar comandos desconhecidos

---

## 📊 Entidades Principais

```sql
-- Tenant: Cliente/Empresa usando AltChat
Tenant (id, name, slug, status)
  ├── Client (id, tenantId, name, clientKey)
  │   ├── ClientConfig (id, protocol, version, configJson)
  │   ├── Session (id, externalUserId, state, status)
  │   │   ├── Event (id, type, payloadJson)
  │   │   └── Command (id, protocol, commandsJson)
  │   └── ApiKey (id, keyHash, status)
  └── AuditLog (id, action, entity, actor)
```

---

## 🔒 Segurança

### Autenticação
- **API Key** (server-to-server): `X-AltChat-Api-Key` header
- **JWT** (opcional, console admin): Bearer token

### Autorização
- **Multi-tenant:** Filtrar por `tenant_id` em toda query
- **Rate Limiting:** 100 req/min por API Key
- **Validação:** Eventos contra schema AIP/ACPP

### Auditoria
- Registrar todas as ações administrativas
- Retenção de 365 dias

---

## 🧪 Testes

### Testes Unitários
- Backend: Jest para services, controllers, middleware
- Frontend: Jest + React Testing Library para componentes

### Testes de Integração
- Fluxo completo: API → Banco → Client
- Verificar ACPP aplicado corretamente
- Testar todos os 8 comandos AIP

### Testes de Segurança
- API Key validation
- Multi-tenant isolation
- Rate limit enforcement

---

## 📈 Roadmap (Além de V1)

### V2 (4-6 meses)
- Designer visual de fluxos (drag-and-drop)
- SDK React oficial
- Temas avancados
- Billing básico
- Multi-ambiente (staging/prod)

### V3 (6-12 meses)
- IA/NLP para routing automático
- Webhooks para sistemas externos
- Integrações CRM
- Analytics avançado
- Suporte multicanal (WhatsApp, SMS, Telegram)

---

## 📞 Suporte e Dúvidas

### Estrutura de Documentação
- Cada documento é **auto-contido** mas **referencia** os outros
- Índices e tabelas facilitam busca rápida
- Exemplos de código em cada seção

### Como Usar
1. **Comece pelo Quick Start** acima
2. **Leia sua trilha completa** antes de codificar
3. **Volte aos docs** ao implementar cada sprint
4. **Consulte a referência** quando tiver dúvidas específicas

### Glossário Rápido

| Termo | Definição |
|-------|-----------|
| **ACPP** | AltChat Client Presentation Protocol (visual) |
| **AIP** | AltChat Interaction Protocol (conversação) |
| **Tenant** | Cliente/Empresa usando AltChat |
| **Client** | Instância do AltChat de um tenant |
| **Session** | Conversa única entre usuário e server |
| **Event** | Ação do usuário (mensagem, clique, etc) |
| **Command** | Instrução do server para o client renderizar |
| **State** | Ponto na máquina de estados da conversa |

---

## 📝 Notas de Implementação

### Backend Developers
- Comece com `02_DATABASE_SPECIFICATION.md`
- Setup Prisma e PostgreSQL
- Implemente endpoints de `01_API_SPECIFICATION.md`
- Adicione segurança (Auth, Rate Limit, Audit)

### Frontend Developers
- Comece com `03_PROTOCOL_SPECIFICATION.md`
- Entenda diferença entre ACPP e AIP
- Implemente CommandRenderer para cada comando
- Gerencie Session lifecycle
- Integre com Backend API

### Full-Stack / Tech Leads
- Leia `04_IMPLEMENTATION_GUIDE.md` primeiro
- Planeje sprints conforme sugerido
- Configure monorepo (Turborepo/Pnpm)
- Coordene backend + frontend em paralelo

---

## ✅ Checklist Pré-Desenvolvimento

- [ ] Equipe leu todos os 4 documentos
- [ ] Stack aprovada (Node.js, React, PostgreSQL, Prisma)
- [ ] Ambiente local configurado (Docker Compose)
- [ ] Monorepo iniciado (Turborepo + workspaces)
- [ ] Repository criado (GitHub/GitLab)
- [ ] CI/CD pipeline configurado
- [ ] Banco de dados local rodando
- [ ] TypeScript + ESLint configurado
- [ ] Prisma inicializado
- [ ] Protocol package criado com tipos

---

## 📄 Arquivo de Origem

Todos os arquivos foram convertidos de:
- `ALTCHAT_API_SPECIFICATION_V1.docx`
- `ALTCHAT_DATABASE_SPECIFICATION_V1.docx`
- `ALTCHAT_PROTOCOL_SPECIFICATION_V1.docx`
- `ALTCHAT_IMPLEMENTATION_GUIDE_V1.docx`

**Formato Original:** Microsoft Word (.docx)  
**Formato Atual:** Markdown (.md)  
**Data de Conversão:** 2024  
**Status:** Pronto para desenvolvimento

---

## 🎯 Próximos Passos

1. **Week 1:** Leia toda a documentação
2. **Week 2:** Setup ambiente + Sprint 1 (Monorepo, Prisma)
3. **Week 3-4:** Sprint 2 (Client) + Sprint 3 (API)
4. **Week 5-9:** Sprint 4 (Console) + Sprint 5 (SDK)
5. **Week 10-12:** Testes + Cliente Piloto + Deploy

---

**Documento Master para AltChat V1 MVP**  
*Congelado para desenvolvimento - Não alterar sem aprovação*
