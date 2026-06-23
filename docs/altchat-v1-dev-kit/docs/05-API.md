# API do AltChat V1

Base URL:

```text
http://localhost:4300/api
```

## Health

```http
GET /health
```

## Obter configuração do client

```http
GET /api/config/{tenantId}/{clientId}
```

Resposta:

```json
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "presentation": {}
}
```

## Iniciar sessão

```http
POST /api/sessions
```

Body:

```json
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "externalUserId": "visitor_001"
}
```

Resposta:

```json
{
  "session": {},
  "commands": []
}
```

## Enviar evento

```http
POST /api/events
```

Body:

```json
{
  "sessionId": "sess_123",
  "tenantId": "tenant_demo",
  "type": "user.message",
  "payload": {
    "text": "oi"
  }
}
```

Resposta:

```json
{
  "sessionId": "sess_123",
  "commands": []
}
```

## Admin — sessões

```http
GET /api/admin/sessions
```

## Admin — eventos

```http
GET /api/admin/events
```

## Admin — fluxo demo

```http
GET /api/admin/flow
```

## Admin — reset

```http
POST /api/admin/reset
```
