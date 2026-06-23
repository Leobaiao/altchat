# AltChat V1 MVP - Especificação da API

**Versão:** 1.0  
**Data de Congelamento:** V1 MVP  

## Definição Base

AltChat é um framework de conversação Client/Server. O servidor decide o fluxo; o client apenas executa instruções.

---

## 1. Padrão Geral

| Item | Definição |
|------|-----------|
| **Base URL** | `/api/v1` |
| **Formato** | JSON |
| **Autenticação** | API Key para server-to-server; JWT opcional para console |
| **Headers** | `Content-Type: application/json`; `X-AltChat-Api-Key: <key>` |
| **Erros** | JSON padronizado com `code`, `message`, `details` |

---

## 2. Health Check

```
GET /health
```

Endpoint básico para verificar se a API está rodando.

---

## 3. Configuração do Client

Retorna as configurações ACPP e comportamento para um client específico.

```
GET /api/v1/config/{tenantId}/{clientId}
```

### Response 200

```json
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "presentation": { }
}
```

---

## 4. Sessões

### Criar Sessão

```
POST /api/v1/sessions
```

Inicia uma nova sessão conversacional.

#### Request

```json
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "externalUserId": "visitor_001",
  "metadata": {
    "origin": "website"
  }
}
```

#### Response 201

```json
{
  "session": {
    "id": "sess_123",
    "state": "new"
  },
  "commands": []
}
```

### Obter Sessão

```
GET /api/v1/sessions/{sessionId}
```

Recupera os detalhes de uma sessão existente.

### Fechar Sessão

```
POST /api/v1/sessions/{sessionId}/close
```

Encerra uma sessão conversacional.

---

## 5. Eventos

Registra eventos enviados pelo client (mensagens, cliques, uploads).

```
POST /api/v1/events
```

### Request

```json
{
  "sessionId": "sess_123",
  "tenantId": "tenant_demo",
  "clientId": "default",
  "type": "user.message",
  "payload": {
    "text": "oi"
  }
}
```

### Response 200

```json
{
  "sessionId": "sess_123",
  "state": "waiting_cpf",
  "commands": []
}
```

### Tipos de Eventos Suportados

- `user.message` - Mensagem de texto livre do usuário
- `user.input` - Preenchimento de campo
- `button.clicked` - Clique em botão
- `form.submitted` - Envio de formulário
- `file.uploaded` - Upload de arquivo

---

## 6. Uploads de Arquivos

Faz upload de arquivos/anexos ligados a uma sessão.

```
POST /api/v1/attachments
Content-Type: multipart/form-data
```

#### Fields

- `tenantId` - ID do tenant
- `clientId` - ID do client
- `sessionId` - ID da sessão
- `file` - Arquivo binário

#### Response 201

```json
{
  "id": "att_123",
  "fileName": "contrato.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 245000,
  "url": "https://storage/arquivo.pdf"
}
```

---

## 7. Admin Console API

Endpoints para gerenciar tenants, clients, configurações e auditoria.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/admin/dashboard` | GET | Métricas do console |
| `/api/v1/admin/sessions` | GET | Lista sessões |
| `/api/v1/admin/sessions/{id}` | GET | Detalhe de sessão |
| `/api/v1/admin/events` | GET | Eventos |
| `/api/v1/admin/clients` | GET/POST | Clientes/configurações |
| `/api/v1/admin/client-configs` | GET/POST | ACPP por client |
| `/api/v1/admin/api-keys` | GET/POST | Chaves de API |
| `/api/v1/admin/audit-logs` | GET | Auditoria |

---

## 8. Gerenciar Chaves de API

Cria e rotaciona chaves de API para autenticação server-to-server.

```
POST /api/v1/admin/api-keys
```

### Request

```json
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "name": "Production Key"
}
```

### Response

```json
{
  "id": "key_123",
  "plainTextKey": "altchat_live_xxx"
}
```

**Nota:** A chave em texto plano é mostrada apenas uma vez. Guardar com segurança.

---

## 9. Códigos de Erro Padronizados

Toda resposta de erro segue a estrutura:

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Sessão não encontrada.",
    "details": {}
  }
}
```

### Tabela de Códigos

| Código | HTTP | Quando Ocorre |
|--------|------|---------------|
| `INVALID_PAYLOAD` | 400 | Payload inválido ou malformado |
| `UNAUTHORIZED` | 401 | API Key ausente ou inválida |
| `FORBIDDEN` | 403 | Tenant sem permissão de acesso |
| `SESSION_NOT_FOUND` | 404 | Sessão inexistente |
| `RATE_LIMITED` | 429 | Muitas requisições no período |
| `INTERNAL_ERROR` | 500 | Erro inesperado no servidor |

---

## 10. OpenAPI Specification

Estrutura mínima de OpenAPI 3.0.3 para documentação automática:

```yaml
openapi: 3.0.3
info:
  title: AltChat API
  version: 1.0.0
servers:
  - url: https://api.altchat.io/api/v1
security:
  - ApiKeyAuth: []
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-AltChat-Api-Key
```

---

## 11. Regras de Segurança

Toda requisição de produção deve:

1. **Validar API Key** - Obrigatório; falha com `UNAUTHORIZED`
2. **Validar Tenant** - Filtrar dados por `tenantId`
3. **Validar Client** - Verificar se client pertence ao tenant
4. **Validar Origem** - Permitir apenas origens configuradas
5. **Rate Limit** - Aplicar limite por API Key ou IP
6. **Validação de Schema** - Eventos e configurações contra AIP/ACPP

---

## Exemplos de Fluxo Completo

### 1. Iniciar uma Sessão

```bash
curl -X POST http://localhost:4300/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-AltChat-Api-Key: sk_live_xxx" \
  -d '{
    "tenantId": "tenant_demo",
    "clientId": "default",
    "externalUserId": "user_123"
  }'
```

### 2. Enviar um Evento

```bash
curl -X POST http://localhost:4300/api/v1/events \
  -H "Content-Type: application/json" \
  -H "X-AltChat-Api-Key: sk_live_xxx" \
  -d '{
    "sessionId": "sess_123",
    "tenantId": "tenant_demo",
    "clientId": "default",
    "type": "user.message",
    "payload": {
      "text": "Quero abrir um chamado"
    }
  }'
```

### 3. Fazer Upload de Arquivo

```bash
curl -X POST http://localhost:4300/api/v1/attachments \
  -H "X-AltChat-Api-Key: sk_live_xxx" \
  -F "tenantId=tenant_demo" \
  -F "clientId=default" \
  -F "sessionId=sess_123" \
  -F "file=@contrato.pdf"
```

---

## Notas de Implementação

- **Tokens JWT opcionais:** Para o console admin, pode-se usar JWT em lugar de API Key
- **Rate Limiting:** Recomenda-se 100 requisições por minuto por API Key
- **Timeouts:** Sessões expiram após inatividade (configurável, padrão 30 min)
- **Persistência de Sessão:** Mantém estado da conversação mesmo após refresh do navegador

---

**Documento gerado para implementação do AltChat V1 MVP**
