# AltChat V1 MVP - Especificação do Banco de Dados

**Versão:** 1.0  
**Data de Congelamento:** V1 MVP  

## Definição Base

AltChat é um framework de conversação Client/Server. O servidor decide o fluxo; o client apenas executa instruções.

---

## 1. Objetivo

Definir o modelo de dados persistente para transformar a POC em V1 MVP com dados armazenados em PostgreSQL.

---

## 2. Banco Oficial da V1 MVP

| Item | Decisão |
|------|---------|
| **Banco Relacional** | PostgreSQL 14+ |
| **ORM Recomendado** | Prisma |
| **Cache Futuro** | Redis |
| **Storage de Arquivos** | S3 compatível / MinIO para ambientes próprios |
| **Multi-tenant** | `tenant_id` obrigatório nas tabelas operacionais |

---

## 3. Entidades Principais

| Tabela | Descrição |
|--------|-----------|
| `tenants` | Clientes/empresas usando AltChat |
| `clients` | Instâncias/configurações de client por tenant |
| `client_configs` | ACPP versionado por client |
| `sessions` | Sessões conversacionais |
| `events` | Eventos recebidos do client |
| `commands` | Comandos enviados pelo servidor |
| `messages` | Mensagens renderizadas/trocadas |
| `attachments` | Arquivos enviados |
| `api_keys` | Chaves de API por tenant/client |
| `webhooks` | Callbacks para aplicações externas |
| `audit_logs` | Auditoria técnica e administrativa |

---

## 4. DDL Sugerido

### Tabela: tenants

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(80) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: clients

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  client_key VARCHAR(120) UNIQUE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: client_configs

```sql
CREATE TABLE client_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  protocol VARCHAR(20) NOT NULL DEFAULT 'ACPP',
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  config_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  external_user_id VARCHAR(160),
  state VARCHAR(80) NOT NULL DEFAULT 'new',
  context_json JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);
```

**Estados válidos:** `new`, `waiting_cpf`, `waiting_form`, `closed`, etc.  
**Status válidos:** `open`, `closed`, `archived`

### Tabela: events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type VARCHAR(80) NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Tipos de eventos:** `user.message`, `user.input`, `button.clicked`, `form.submitted`, `file.uploaded`

### Tabela: commands

```sql
CREATE TABLE commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  protocol VARCHAR(20) NOT NULL DEFAULT 'AIP',
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  commands_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: attachments

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: api_keys

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);
```

### Tabela: audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  actor_type VARCHAR(40) NOT NULL,
  actor_id VARCHAR(160),
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120),
  entity_id VARCHAR(160),
  payload_json JSONB NOT NULL DEFAULT '{}',
  ip_address VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**actor_type válidos:** `admin`, `system`, `api_client`  
**actions válidos:** `create`, `update`, `delete`, `login`, `api_call`

---

## 5. Índices Obrigatórios

```sql
-- Clientes por tenant
CREATE INDEX idx_clients_tenant ON clients(tenant_id);

-- Sessões por tenant e client
CREATE INDEX idx_sessions_tenant_client ON sessions(tenant_id, client_id);

-- Status das sessões para filtros
CREATE INDEX idx_sessions_status ON sessions(status);

-- Eventos por sessão com ordem de tempo
CREATE INDEX idx_events_session ON events(session_id, created_at DESC);

-- Eventos por tipo para análise
CREATE INDEX idx_events_type ON events(type);

-- Comandos por sessão
CREATE INDEX idx_commands_session ON commands(session_id, created_at DESC);

-- Anexos por sessão
CREATE INDEX idx_attachments_session ON attachments(session_id);

-- Logs de auditoria por tenant e data
CREATE INDEX idx_audit_tenant_date ON audit_logs(tenant_id, created_at DESC);

-- Chaves de API ativas
CREATE INDEX idx_api_keys_active ON api_keys(status, created_at DESC);

-- Configurações ativas
CREATE INDEX idx_client_configs_active ON client_configs(client_id, is_active);
```

---

## 6. Prisma Schema Sugerido

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  clients       Client[]
  sessions      Session[]
  events        Event[]
  commands      Command[]
  attachments   Attachment[]
  apiKeys       ApiKey[]
  auditLogs     AuditLog[]
}

model Client {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  clientKey String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sessions      Session[]
  configs       ClientConfig[]
  events        Event[]
  commands      Command[]
  attachments   Attachment[]
  apiKeys       ApiKey[]
  
  @@index([tenantId])
}

model ClientConfig {
  id        String   @id @default(uuid())
  tenantId  String
  clientId  String
  protocol  String   @default("ACPP")
  version   String   @default("1.0")
  configJson Json
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@index([clientId, isActive])
}

model Session {
  id             String   @id @default(uuid())
  tenantId       String
  clientId       String
  externalUserId String?
  state          String   @default("new")
  contextJson    Json     @default("{}")
  status         String   @default("open")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  closedAt       DateTime?
  
  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client      Client       @relation(fields: [clientId], references: [id], onDelete: Cascade)
  events      Event[]
  commands    Command[]
  attachments Attachment[]
  
  @@index([tenantId, clientId])
  @@index([status])
}

model Event {
  id          String   @id @default(uuid())
  tenantId    String
  clientId    String
  sessionId   String
  type        String
  payloadJson Json     @default("{}")
  createdAt   DateTime @default(now())
  
  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client  Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId, createdAt])
  @@index([type])
}

model Command {
  id          String   @id @default(uuid())
  tenantId    String
  clientId    String
  sessionId   String
  protocol    String   @default("AIP")
  version     String   @default("1.0")
  commandsJson Json
  createdAt   DateTime @default(now())
  
  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client  Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId, createdAt])
}

model Attachment {
  id          String   @id @default(uuid())
  tenantId    String
  clientId    String
  sessionId   String
  fileName    String
  mimeType    String
  sizeBytes   BigInt
  storageUrl  String
  createdAt   DateTime @default(now())
  
  tenant  Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client  Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId])
}

model ApiKey {
  id        String   @id @default(uuid())
  tenantId  String
  clientId  String?
  name      String
  keyHash   String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  revokedAt DateTime?
  lastUsedAt DateTime?
  
  tenant Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client Client? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  
  @@index([status])
}

model AuditLog {
  id         String   @id @default(uuid())
  tenantId   String?
  actorType  String
  actorId    String?
  action     String
  entity     String?
  entityId   String?
  payloadJson Json    @default("{}")
  ipAddress  String?
  createdAt  DateTime @default(now())
  
  tenant Tenant? @relation(fields: [tenantId], references: [id], onDelete: SetNull)
  
  @@index([tenantId, createdAt])
}
```

---

## 7. Regras Multi-tenant

**Criticamente importante:**

1. **Toda consulta operacional deve filtrar `tenant_id`**
   - Exemplo: `SELECT * FROM sessions WHERE tenant_id = ? AND client_id = ?`

2. **Nenhum endpoint pode retornar dados de outro tenant**
   - Validar no middleware de autorização

3. **API Keys devem possuir `tenant_id` associado**
   - Uma chave é vinculada a um tenant, não global

4. **Isolamento no ORM**
   - Use constraints em Prisma: `@relation(onDelete: Cascade)`

5. **Auditoria de acesso cruzado**
   - Registrar qualquer tentativa de acesso a dados de outro tenant

---

## 8. Retenção de Dados

| Dado | Retenção MVP | Observação |
|------|--------------|-----------|
| **sessions** | 180 dias | Configurável futuramente |
| **events** | 90 dias | Pode crescer muito em volume |
| **commands** | 90 dias | Usado para debug |
| **attachments** | Conforme tenant | Controlar por storage disponível |
| **audit_logs** | 365 dias | Importante para suporte e compliance |

**Política de limpeza:**

```sql
-- Limpar eventos antigos (executar diariamente)
DELETE FROM events 
WHERE created_at < now() - interval '90 days';

-- Limpar sessões fechadas há mais de 180 dias
DELETE FROM sessions 
WHERE status = 'closed' AND closed_at < now() - interval '180 days';
```

---

## 9. Migração da POC para V1

1. **Substituir arrays em memória** por repositories Prisma
2. **Flow Engine** deve receber session persistida
3. **Atualizar `context_json`** e `state` a cada evento
4. **Registrar todos os comandos** em `commands` table
5. **Manter histórico** de eventos para replay/debug

### Exemplo de Fluxo:

```
1. Evento recebido → validar contra schema
2. Buscar session do banco → SELECT * FROM sessions WHERE id = ?
3. Atualizar context_json com novo estado
4. Executar Flow Engine (state machine)
5. Gerar comandos → INSERT INTO commands
6. Retornar comandos ao client
```

---

## 10. Performance e Escalabilidade

### Estratégia de Query

- **JSONB indexing:** Use `GIN` indexes para buscas rápidas em `config_json`, `context_json`, `payload_json`

```sql
CREATE INDEX idx_context_json ON sessions USING gin(context_json);
CREATE INDEX idx_payload_json ON events USING gin(payload_json);
```

### Sharding Futuro

Para escala além de 10M sessões:
- Particionar `events` e `sessions` por `tenant_id`
- Considerar Read Replicas para relatórios

### Connection Pooling

- Use `pgBouncer` ou Prisma's connection pooling
- Configurar `max_pool_size = 20` para MVP

---

## 11. Checklist de Setup

- [ ] PostgreSQL 14+ instalado
- [ ] Banco `altchat` criado
- [ ] Usuário com permissões de DDL
- [ ] Prisma inicializado e schema criado
- [ ] Migrations geradas: `npx prisma migrate dev --name init`
- [ ] Índices criados
- [ ] Seed data (tenants de teste) populado
- [ ] Backup diário configurado
- [ ] Logs de queries habilitados (para debugging)

---

**Documento gerado para implementação do AltChat V1 MVP**
