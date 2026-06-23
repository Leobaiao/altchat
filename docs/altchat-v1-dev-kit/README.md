# AltChat V1 — Developer Kit

AltChat é um mecanismo de conversação Client/Server.

Ele não é Help Desk, não é WhatsApp, não é CRM e não é NUUVO.

O AltChat permite que uma aplicação server-side, como AltDesk, ERP, CRM, portal ou qualquer outro sistema, conduza uma conversa com um usuário através de um client embutido ou standalone.

## O que este pacote contém

```text
altchat-v1-dev-kit
├── backend                API server + pseudo server de demonstração
├── frontend               Client AltChat + Server Console
├── docs                   Documentação técnica
├── examples               Exemplos de payloads
└── README.md              Guia principal
```

## Componentes

### 1. AltChat Client

Renderiza a conversa para o usuário.

Ele executa comandos recebidos do servidor:

- show_message
- request_input
- show_buttons
- show_form
- upload_file
- redirect
- wait
- clear
- close

### 2. Server Application / Pseudo Server

Representa a aplicação server-side que decide o fluxo.

Neste MVP ele simula um servidor de negócio, como se fosse o AltDesk ou outro sistema.

### 3. Server Console

Interface para o desenvolvedor:

- ver configuração do client
- ver sessões
- testar eventos
- consultar documentação dos comandos
- visualizar payloads

## Instalação rápida

Pré-requisitos:

- Node.js 20+
- npm 10+

```bash
cd altchat-v1-dev-kit
npm install
npm run install:all
npm run dev
```

Acesse:

```text
Frontend / Console:
http://localhost:5173

Backend:
http://localhost:4300/health
```

## Instalação manual

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Como testar

1. Abra `http://localhost:5173`
2. Entre na aba **Client Demo**
3. Digite "oi"
4. Siga o fluxo guiado
5. Acesse a aba **Server Console**
6. Veja sessões, configuração e eventos

## Conceito central

```text
Usuário
  ↓
AltChat Client
  ↓
Evento JSON
  ↓
Server Application
  ↓
Comandos JSON
  ↓
AltChat Client
  ↓
Usuário
```

## Importante

O AltChat não decide o fluxo.

O servidor decide.

O client apenas executa comandos.
