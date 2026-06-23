# Instalação do AltChat V1

## Pré-requisitos

Instale:

- Node.js 20 ou superior
- npm 10 ou superior
- Git opcional

Verifique:

```bash
node -v
npm -v
```

## Instalação

Extraia o ZIP.

Entre na pasta:

```bash
cd altchat-v1-dev-kit
```

Instale dependências da raiz:

```bash
npm install
```

Instale backend e frontend:

```bash
npm run install:all
```

Rode tudo:

```bash
npm run dev
```

## URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:4300/health
```

## Rodando separado

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

## Problemas comuns

### Porta ocupada

Backend usa porta 4300.

Frontend usa porta 5173.

Altere em:

```text
backend/.env
frontend/src/config.ts
```

### Erro de CORS

Confirme se o frontend está em:

```text
http://localhost:5173
```

e se o backend está com:

```text
FRONTEND_ORIGIN=http://localhost:5173
```
