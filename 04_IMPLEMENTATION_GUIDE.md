# AltChat V1 MVP - Guia de Implementação

**Versão:** 1.0  
**Data de Congelamento:** V1 MVP  

## Definição Base

AltChat é um framework de conversação Client/Server. O servidor decide o fluxo; o client apenas executa instruções.

---

## 1. Objetivo

Este guia define como transformar o Developer Kit atual em uma **V1 MVP utilizável por um cliente piloto**.

---

## 2. Stack Recomendada

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js 20 + Express + TypeScript |
| **Frontend** | React + Vite + TypeScript |
| **Banco** | PostgreSQL 14+ |
| **ORM** | Prisma |
| **Cache (futuro)** | Redis |
| **Storage** | S3 compatível / MinIO |
| **Deploy (MVP)** | Docker Compose |

---

## 3. Instalação Local do Kit Atual

```bash
# Descompactar kit
unzip ALTCHAT_V1_DEV_KIT_COMPLETO.zip
cd altchat-v1-dev-kit

# Instalar dependências
npm install
npm run install:all

# Iniciar em desenvolvimento
npm run dev
```

### URLs de Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend Health | http://localhost:4300/health |

---

## 4. Estrutura Final de Projeto Recomendada

```
altchat/
├── apps/
│   ├── api/                    # Backend REST API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── console/                # Admin Console (React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── demo/                   # Demo Application (opcional)
│
├── packages/
│   ├── client/                 # Web Component / JS SDK
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── react/                  # React SDK/Hook
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── protocol/               # Tipos ACPP/AIP compartilhados
│   │   ├── src/
│   │   │   ├── acpp.ts
│   │   │   ├── aip.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ui/                     # Componentes visuais reutilizáveis
│       ├── src/
│       └── package.json
│
├── prisma/
│   ├── schema.prisma           # Schema do banco
│   └── migrations/             # Histórico de migrações
│
├── docker-compose.yml
├── .env.example
└── docs/
    ├── API_SPECIFICATION.md
    ├── DATABASE_SPECIFICATION.md
    ├── PROTOCOL_SPECIFICATION.md
    └── IMPLEMENTATION_GUIDE.md
```

---

## 5. Sprint 1 - Fundação Técnica

**Duração:** 1-2 semanas

### Entrega 1: Monorepo Setup

| Item | Descrição | Pronto Quando |
|------|-----------|--------------|
| Package manager | Turborepo ou Pnpm workspaces | `npm install` funciona |
| Shared tsconfig | Configuração TypeScript centralizada | Todos importam `@altchat/tsconfig` |
| Linting & Formatting | ESLint + Prettier configurados | `npm run lint` passa em todos apps |

**Tarefas:**
```bash
# Setup monorepo
npm init -y
npm install -D turbo pnpm

# Gerar tsconfig compartilhado
mkdir -p packages/tsconfig
# ... copiar tsconfig.json

# Setup linting
npm install -D eslint prettier @typescript-eslint/parser
```

### Entrega 2: Protocol Package

Tipos TypeScript compartilhados entre backend e frontend.

**Arquivo:** `packages/protocol/src/index.ts`

```typescript
// ACPP Types
export interface ACPP {
  protocol: "ACPP";
  version: "1.0";
  client: {
    title: string;
    subtitle?: string;
    avatarUrl?: string;
    logoUrl?: string;
  };
  window: {
    mode: "embedded" | "popup" | "fullscreen";
    width?: number;
    height?: number;
    resizable?: boolean;
  };
  theme: {
    mode: "light" | "dark" | "auto";
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  behavior: {
    autoOpen?: boolean;
    showWelcome?: boolean;
    typingIndicator?: boolean;
    persistSession?: boolean;
  };
  capabilities: {
    text: boolean;
    file: boolean;
    image?: boolean;
    audio?: boolean;
    video?: boolean;
  };
  session: {
    timeoutSeconds: number;
    keepAlive?: boolean;
  };
}

// AIP Types
export type AICommand =
  | ShowMessageCommand
  | RequestInputCommand
  | ShowButtonsCommand
  | ShowFormCommand
  | UploadFileCommand
  | WaitCommand
  | RedirectCommand
  | ClearCommand
  | CloseCommand;

export interface ShowMessageCommand {
  action: "show_message";
  text: string;
  rich?: boolean;
}

export interface RequestInputCommand {
  action: "request_input";
  text: string;
  field: InputField;
}

export interface InputField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  mask?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: { label: string; value: string }[];
}

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "cpf"
  | "cnpj"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

// Event Types
export type ClientEvent =
  | UserMessageEvent
  | UserInputEvent
  | ButtonClickedEvent
  | FormSubmittedEvent
  | FileUploadedEvent;

export interface UserMessageEvent {
  type: "user.message";
  payload: { text: string };
}

export interface UserInputEvent {
  type: "user.input";
  payload: { field: string; value: any };
}

export interface ButtonClickedEvent {
  type: "button.clicked";
  payload: { value: string };
}

export interface FormSubmittedEvent {
  type: "form.submitted";
  payload: { form: string; values: Record<string, any> };
}

export interface FileUploadedEvent {
  type: "file.uploaded";
  payload: {
    attachmentId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  };
}
```

**Pronto quando:**
- Backend importa tipos: `import { ACPP, AICommand } from "@altchat/protocol"`
- Frontend importa tipos: `import { ClientEvent } from "@altchat/protocol"`
- Build sem erros: `npm run build`

### Entrega 3: Prisma + PostgreSQL

**Arquivo:** `prisma/schema.prisma`

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

  clients   Client[]
  sessions  Session[]
  events    Event[]
  commands  Command[]
  apiKeys   ApiKey[]
}

model Client {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  clientKey String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant   Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sessions Session[]
  configs  ClientConfig[]
  events   Event[]
  commands Command[]
  apiKeys  ApiKey[]

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

  tenant Tenant @relation(fields: [tenantId], references: [id])
  client Client @relation(fields: [clientId], references: [id])

  @@unique([clientId, isActive])
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

  tenant   Tenant       @relation(fields: [tenantId], references: [id])
  client   Client       @relation(fields: [clientId], references: [id])
  events   Event[]
  commands Command[]

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

  tenant  Tenant  @relation(fields: [tenantId], references: [id])
  client  Client  @relation(fields: [clientId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])

  @@index([sessionId, createdAt])
  @@index([type])
}

model Command {
  id           String   @id @default(uuid())
  tenantId     String
  clientId     String
  sessionId    String
  protocol     String   @default("AIP")
  version      String   @default("1.0")
  commandsJson Json
  createdAt    DateTime @default(now())

  tenant  Tenant  @relation(fields: [tenantId], references: [id])
  client  Client  @relation(fields: [clientId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])

  @@index([sessionId, createdAt])
}

model ApiKey {
  id        String   @id @default(uuid())
  tenantId  String
  name      String
  keyHash   String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  revokedAt DateTime?

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, status])
}
```

**Setup:**
```bash
# Instalar Prisma
npm install @prisma/client
npm install -D prisma

# Inicializar
npx prisma init

# Criar primeira migração
npx prisma migrate dev --name init

# Gerar client
npx prisma generate
```

**Pronto quando:**
- Migrations rodaram: `prisma/migrations/*/migration.sql` existe
- Banco conecta: `npx prisma db push` sem erros
- Seed data criado (opcional)

### Entrega 4: Environment Config

**Arquivo:** `.env.example`

```env
# Database
DATABASE_URL=postgresql://altchat:altchat@localhost:5432/altchat

# API
NODE_ENV=development
PORT=4300
API_URL=http://localhost:4300

# Console
CONSOLE_URL=http://localhost:5173

# JWT (opcional para console)
JWT_SECRET=your-super-secret-key-change-in-production

# Storage (MinIO ou S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=altchat-dev
```

**Comando de inicialização:**
```bash
# Copiar .env.example
cp .env.example .env

# Preencher valores para seu ambiente
```

---

## 6. Sprint 2 - Client MVP

**Duração:** 2-3 semanas

### Entrega 1: Renderização de Comandos AIP

Implementar no frontend (React/Vue) a renderização básica:

```typescript
// components/CommandRenderer.tsx
import React from 'react';
import { AICommand } from '@altchat/protocol';

interface Props {
  command: AICommand;
  onInput: (value: any) => void;
}

export const CommandRenderer: React.FC<Props> = ({ command, onInput }) => {
  switch (command.action) {
    case 'show_message':
      return <div className="message">{command.text}</div>;

    case 'request_input':
      return (
        <InputField
          field={command.field}
          onSubmit={(value) => onInput({ field: command.field.name, value })}
        />
      );

    case 'show_buttons':
      return (
        <div className="buttons">
          {command.buttons.map((btn) => (
            <button key={btn.value} onClick={() => onInput({ value: btn.value })}>
              {btn.label}
            </button>
          ))}
        </div>
      );

    case 'show_form':
      return (
        <FormRenderer
          form={command.form}
          onSubmit={(values) => onInput({ form: command.form.name, values })}
        />
      );

    case 'upload_file':
      return (
        <FileUploadField
          accept={command.file.accept}
          maxSize={command.file.maxSizeBytes}
          onUpload={(file) => onInput({ attachmentId: file.id })}
        />
      );

    case 'wait':
      return <Spinner text={command.text} />;

    case 'close':
      return <div className="message">Sessão encerrada.</div>;

    default:
      return null;
  }
};
```

**Pronto quando:**
- Todos os 8 comandos renderizam sem erro
- Validação de campos funciona
- Eventos são enviados ao backend corretamente

### Entrega 2: Aplicar Tema ACPP

```typescript
// hooks/useACPP.ts
import { ACPP } from '@altchat/protocol';
import { useEffect, useState } from 'react';

export const useACPP = () => {
  const [config, setConfig] = useState<ACPP | null>(null);

  useEffect(() => {
    fetch(`/api/v1/config/${tenantId}/${clientId}`)
      .then((r) => r.json())
      .then((data) => setConfig(data.acpp));
  }, []);

  return config;
};

// App.tsx
import { useACPP } from './hooks/useACPP';

export function App() {
  const acpp = useACPP();

  if (!acpp) return <Loading />;

  return (
    <div
      style={{
        width: acpp.window.width,
        height: acpp.window.height,
        backgroundColor: acpp.theme.backgroundColor,
        color: acpp.theme.textColor,
      }}
    >
      <header style={{ borderBottomColor: acpp.theme.primaryColor }}>
        {acpp.client.avatarUrl && (
          <img src={acpp.client.avatarUrl} alt="Avatar" />
        )}
        <h1>{acpp.client.title}</h1>
      </header>

      <main>
        {/* Renderizar comandos aqui */}
      </main>
    </div>
  );
}
```

**Pronto quando:**
- ACPP carrega no mount
- Tema aplica colors, fonts, window size
- Layout responde a diferentes modos (`popup`, `embedded`, `fullscreen`)

### Entrega 3: Ciclo de Vida de Sessão

```typescript
// services/sessionService.ts
export class SessionService {
  async createSession(tenantId: string, clientId: string) {
    const res = await fetch('/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, clientId }),
    });
    return res.json();
  }

  async sendEvent(sessionId: string, event: ClientEvent) {
    const res = await fetch('/api/v1/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        tenantId: this.tenantId,
        clientId: this.clientId,
        ...event,
      }),
    });
    return res.json();
  }

  async closeSession(sessionId: string) {
    await fetch(`/api/v1/sessions/${sessionId}/close`, {
      method: 'POST',
    });
  }
}

// hooks/useSession.ts
export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initSession = async () => {
    setLoading(true);
    try {
      const { session } = await sessionService.createSession(
        tenantId,
        clientId
      );
      setSessionId(session.id);

      // Persistir se configurado
      if (persistSession) {
        localStorage.setItem('altchat_session_id', session.id);
      }
    } finally {
      setLoading(false);
    }
  };

  // Recuperar session ao mount
  useEffect(() => {
    const stored = localStorage.getItem('altchat_session_id');
    if (stored) {
      setSessionId(stored);
    } else {
      initSession();
    }
  }, []);

  return { sessionId, initSession, loading };
};
```

**Pronto quando:**
- Session criada ao iniciar client
- Refresh mantém session (se `persistSession: true`)
- Eventos enviados com `sessionId` correto
- Close finaliza sessão

### Entrega 4: Error Handling

```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props> {
  state = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h2>Algo deu errado</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 7. Sprint 3 - API e Segurança

**Duração:** 2 semanas

### Entrega 1: Autenticação com API Key

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-altchat-api-key'];

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'API Key ausente',
      },
    });
  }

  // Verificar key no banco
  const key = await prisma.apiKey.findUnique({
    where: { keyHash: hash(apiKey) },
    include: { tenant: true },
  });

  if (!key || key.status !== 'active') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'API Key inválida',
      },
    });
  }

  // Anexar ao request
  (req as any).tenant = key.tenant;
  (req as any).apiKey = key;

  next();
};

// routes
app.use('/api/v1', validateApiKey);
```

### Entrega 2: Isolamento Multi-tenant

```typescript
// middleware/tenantFilter.ts
export const filterByTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenant = (req as any).tenant;
  const { tenantId } = req.body;

  if (tenantId !== tenant.id) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Acesso negado a este tenant',
      },
    });
  }

  next();
};

// routes
app.post('/api/v1/sessions', filterByTenant, createSession);
```

### Entrega 3: Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  keyGenerator: (req) => (req as any).apiKey.id,
  skip: (req) => process.env.NODE_ENV === 'development',
});

app.use('/api/v1', limiter);
```

### Entrega 4: Audit Logs

```typescript
// services/auditService.ts
export async function logAction(
  tenantId: string,
  action: string,
  entity: string,
  entityId: string,
  actorId: string
) {
  await prisma.auditLog.create({
    data: {
      tenantId,
      action,
      entity,
      entityId,
      actorId,
      actorType: 'api_client',
      ipAddress: getClientIp(),
    },
  });
}

// routes/events.ts
export async function createEvent(req: Request, res: Response) {
  const { sessionId, type, payload } = req.body;
  const tenant = (req as any).tenant;

  const event = await prisma.event.create({
    data: { sessionId, type, payloadJson: payload },
  });

  await logAction(tenant.id, 'create_event', 'event', event.id, tenant.id);

  res.json(event);
}
```

---

## 8. Sprint 4 - Server Console MVP

**Duração:** 2-3 semanas

Implementar interface React para admins gerenciarem tenants, clients e sessões.

### Telas Obrigatórias

| Tela | Funcionalidades |
|------|-----------------|
| **Dashboard** | KPIs: sessões abertas, eventos/hora, erros, uptime |
| **Clients** | CRUD de clients, editar ACPP, ativar/desativar |
| **Sessions** | Buscar, filtrar por status, ver histórico, encerrar manualmente |
| **Events** | Inspeção de payloads, filtro por tipo |
| **API Keys** | Gerar, revogar, rotacionar chaves |
| **Test Console** | Simular eventos e ver comandos retornados |

### Exemplo: Tela de Sessions

```typescript
// pages/SessionsPage.tsx
import React, { useEffect, useState } from 'react';

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState({ status: 'open' });

  useEffect(() => {
    fetch(`/api/v1/admin/sessions?status=${filter.status}`)
      .then((r) => r.json())
      .then((data) => setSessions(data));
  }, [filter]);

  return (
    <div className="page">
      <h1>Sessões</h1>

      <div className="filters">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ status: e.target.value })}
        >
          <option value="open">Abertas</option>
          <option value="closed">Fechadas</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Estado</th>
            <th>Criado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.externalUserId}</td>
              <td>{s.state}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => closeSession(s.id)}>Encerrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 9. Sprint 5 - SDK Embutível

**Duração:** 1-2 semanas

Criar script que pode ser carregado em qualquer site.

```html
<!-- Cliente insere isso no site -->
<script src="https://cdn.altchat.io/v1/altchat.js"></script>
<script>
  AltChat.init({
    tenantId: "tenant_demo",
    clientId: "default",
    endpoint: "https://api.altchat.io/api/v1",
    apiKey: "public_client_key"
  });
</script>
```

**Arquivo:** `packages/client/src/index.ts`

```typescript
// altchat.js
(function() {
  window.AltChat = {
    init(options) {
      // Criar iframe isolado
      const iframe = document.createElement('iframe');
      iframe.src = `https://cdn.altchat.io/v1/widget.html?tenantId=${options.tenantId}&clientId=${options.clientId}`;
      iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 420px;
        height: 680px;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
      `;
      document.body.appendChild(iframe);
    }
  };
})();
```

**Build:**
```bash
# Compilar para UMD bundle
npm run build:client

# Output: dist/altchat.js (~50KB minified + gzip)
```

---

## 10. Docker Compose MVP

**Arquivo:** `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: altchat-postgres
    environment:
      POSTGRES_USER: altchat
      POSTGRES_PASSWORD: altchat
      POSTGRES_DB: altchat
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U altchat"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: altchat-minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: altchat-api
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://altchat:altchat@postgres:5432/altchat
      PORT: 4300
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
    ports:
      - "4300:4300"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/api/src:/app/src

  console:
    build:
      context: .
      dockerfile: apps/console/Dockerfile
    container_name: altchat-console
    environment:
      VITE_API_URL: http://localhost:4300
    ports:
      - "5173:80"
    depends_on:
      - api
    volumes:
      - ./apps/console/src:/app/src

volumes:
  pgdata:
  minio_data:
```

**Startup:**
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down
```

**URLs após iniciar:**
- API: http://localhost:4300
- Console: http://localhost:5173
- MinIO: http://localhost:9001 (user: minioadmin, pass: minioadmin)
- PostgreSQL: localhost:5432

---

## 11. Checklist de V1 MVP

| Item | Obrigatório | Responsável |
|------|-------------|-------------|
| ACPP v1 aplicado no client | ✅ | Frontend |
| AIP v1 com 8 comandos | ✅ | Frontend |
| Sessões persistidas em Postgres | ✅ | Backend |
| Eventos persistidos em Postgres | ✅ | Backend |
| Autenticação com API Key | ✅ | Backend |
| Console de sessões/eventos | ✅ | Frontend (Console) |
| Client embutível básico | ✅ | Client Package |
| Upload de arquivo | ⏳ | Backend |
| Flow Designer visual | ❌ | V2 |
| IA/NLP | ❌ | V3 |

---

## 12. Critérios de Aceite

Um cliente piloto consegue:

1. ✅ **Embutir o client** - Script carregado e widget aparece
2. ✅ **Iniciar sessão** - Sem erros, sessionId criado
3. ✅ **Enviar inputs** - Text, buttons, forms renderizam
4. ✅ **Receber comandos** - Servidor retorna AIP válido
5. ✅ **Preencher formulário** - Multi-field form submit funciona
6. ✅ **Acompanhar no console** - Sessões e eventos visíveis
7. ✅ **Manter dados após restart** - Postgres persiste dados
8. ✅ **Testar com API Key** - Autenticação funciona

---

## 13. Próximos Passos Após MVP

### V2 Features
- Designer visual de fluxos (drag-and-drop)
- SDK React oficial e documentado
- Temas avançados (custom CSS, fonts)
- Sistema de billing básico
- Multi-ambiente (staging, production)
- Analytics de sessões e funil

### V3+ Features
- Integração com IA (NLP para routing)
- Webhooks para sistemas externos
- CRM integrations (Salesforce, HubSpot)
- Analytics avançado (funnel, heatmaps)
- Suporte a canais (WhatsApp, SMS, Telegram)

---

## 14. Resumo de Sprints

```
Week 1-2:   Monorepo + Protocol + Prisma + Env
Week 3-4:   Frontend: Commands + Theme + Session
Week 5-6:   Backend: Auth + Multi-tenant + Rate Limit
Week 7-9:   Console admin com 5 telas
Week 10-11: SDK embutível + Docker
Week 12:    Testing + Cliente piloto + Deploy

Total: ~12 semanas para MVP
```

---

**Documento gerado para implementação do AltChat V1 MVP**
