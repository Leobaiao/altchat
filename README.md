# AltChat

AltChat é um poderoso e altamente customizável framework de conversação e atendimento cliente-servidor, projetado com uma arquitetura "Server-Driven UI" (SDUI). Com o AltChat, você pode criar desde simples webchats em sites até complexas aplicações de autoatendimento, tudo gerenciado por dois protocolos essenciais:

- **AIP (AltChat Interaction Protocol):** Responsável pela lógica da conversa (Wait, Redirect, Show Form, Input Text, etc).
- **ACPP (AltChat Client Presentation Protocol):** Responsável por definir o visual e o estilo da janela de chat no lado do cliente.

---

## 🏗️ Estrutura do Monorepo

Este repositório é gerenciado pelo **Turborepo** + **Pnpm** (ou Npm) e está dividido da seguinte forma:

- `apps/api`: Backend principal escrito em Node.js/Express e Prisma (PostgreSQL). Gerencia o fluxo de estados, webhooks, rate limiting e multi-tenancy.
- `apps/console`: Dashboard e painel administrativo ("Console Admin") focado no desenvolvedor e administrador, onde é possível extrair métricas e analisar chaves de API.
- `packages/client`: O coração visual do AltChat! Trata-se do Web Component interativo que renderiza as janelas de chat. Ele é construído em React, empacotado em um Shadow DOM limpo e sem dependências vazando para o projeto hospedeiro.
- `packages/protocol`: Tipagens e schemas do Zod (v4/v3) compartilhados globalmente.

---

## 🚀 Quick Start (Instalação via Docker)

Você não precisa instalar dependências no seu sistema host para rodar a versão de desenvolvimento do AltChat. Um único comando `docker-compose` é o suficiente.

1. Clone o repositório:
```bash
git clone https://github.com/Leobaiao/altchat.git
cd altchat
```

2. Na raiz do projeto, execute o Docker Compose:
```bash
docker-compose up -d --build
```

3. O ambiente será provisionado com:
- **Banco de Dados (PostgreSQL)**
- **Armazenamento S3 Compatível (MinIO)**: (http://localhost:9001 - user: `minioadmin`, pass: `minioadmin`)
- **Backend (API)**: http://localhost:4300
- **Admin Console**: http://localhost:8080

O banco de dados já virá populado (via seed) com um Tenant de demonstração. Abra o Admin Console para ver as métricas e a aba de Client Debug!

---

## 📚 Documentação e Especificações

O AltChat é um projeto fortemente planejado e documentado. A arquitetura profunda de banco de dados, design de APIs, e definições rigorosas dos protocolos estão todas salvas na pasta [`docs/`](./docs/).

- [Especificação da API](./docs/01_API_SPECIFICATION.md)
- [Modelagem do Banco de Dados](./docs/02_DATABASE_SPECIFICATION.md)
- [Guia Oficial de Protocolos AIP/ACPP](./docs/03_PROTOCOL_SPECIFICATION.md)
- [Roadmap de Implantação e Checklist do MVP](./docs/04_IMPLEMENTATION_GUIDE.md)

As versões brutas (`.docx`) fornecidas nas primeiras concepções do projeto também foram versionadas e mantidas dentro de `/docs`.
