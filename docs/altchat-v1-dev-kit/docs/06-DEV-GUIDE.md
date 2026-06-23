# Guia do Desenvolvedor

## Como integrar o AltChat em uma aplicação

1. A aplicação server-side expõe endpoints compatíveis.
2. O client inicia sessão.
3. O usuário envia evento.
4. O servidor responde com comandos.
5. O client renderiza os comandos.

## Exemplo de integração

```javascript
const response = await fetch("/api/events", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId,
    tenantId,
    type: "user.message",
    payload: { text: "oi" }
  })
});

const result = await response.json();
renderCommands(result.commands);
```

## Como evoluir para produção

### Persistência

Substituir store em memória por:

- PostgreSQL
- Prisma

### Sessões

Persistir sessão em banco e cache em Redis.

### Segurança

Adicionar:

- JWT
- API Keys
- rate limit
- validação por tenant

### Arquivos

Adicionar storage:

- S3
- MinIO
- Azure Blob
- GCP Storage

### Observabilidade

Adicionar:

- logs estruturados
- tracing
- métricas
- dashboard
