# AltChat V1 MVP - Especificação dos Protocolos

**Versão:** 1.0  
**Data de Congelamento:** V1 MVP  

## Definição Base

AltChat é um framework de conversação Client/Server. O servidor decide o fluxo; o client apenas executa instruções.

---

## 1. Objetivo do Documento

Este documento define os protocolos oficiais do AltChat V1 MVP. Ele funciona como **contrato entre a aplicação server-side e o client AltChat**.

---

## 2. Separação dos Protocolos

| Protocolo | Responsabilidade | Quem Envia | Quem Executa |
|-----------|------------------|-----------|--------------|
| **ACPP** | Apresentação visual do client: título, avatar, janela, tema, comportamento e capacidades | Servidor ou configuração inicial | AltChat Client |
| **AIP** | Interação conversacional: mensagens, campos, botões, formulários, uploads e encerramento | Servidor | AltChat Client |

---

## 3. Envelope Padrão de Resposta

Toda resposta de interação deve seguir este formato:

```json
{
  "protocol": "AIP",
  "version": "1.0",
  "sessionId": "sess_123",
  "commands": [
    { "action": "show_message", "text": "Olá!" }
  ]
}
```

**Benefício:** Permite evolução futura sem quebrar clients antigos.

---

## 4. ACPP - AltChat Client Presentation Protocol

O ACPP controla **como** o client será apresentado ao usuário. Ele não contém regra de negócio.

### Estrutura Completa

```json
{
  "protocol": "ACPP",
  "version": "1.0",
  "client": {
    "title": "AltDesk Assistente",
    "subtitle": "Atendimento Online",
    "avatarUrl": "https://empresa.com/avatar.png",
    "logoUrl": "https://empresa.com/logo.png"
  },
  "window": {
    "mode": "popup",
    "width": 420,
    "height": 680,
    "minWidth": 320,
    "minHeight": 500,
    "resizable": true
  },
  "theme": {
    "mode": "light",
    "primaryColor": "#2563EB",
    "secondaryColor": "#111827",
    "backgroundColor": "#FFFFFF",
    "textColor": "#111827"
  },
  "behavior": {
    "autoOpen": false,
    "showWelcome": true,
    "typingIndicator": true,
    "persistSession": true
  },
  "capabilities": {
    "text": true,
    "file": true,
    "image": true,
    "audio": false,
    "video": false
  },
  "session": {
    "timeoutSeconds": 1800,
    "keepAlive": true
  }
}
```

### Referência de Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `client.title` | string | ✅ | Nome exibido no cabeçalho do chat |
| `client.subtitle` | string | ❌ | Texto secundário abaixo do título |
| `client.avatarUrl` | url | ❌ | Imagem do avatar do chat (quadrada, ~100px) |
| `client.logoUrl` | url | ❌ | Logo principal |
| `window.mode` | enum | ✅ | `embedded`, `popup`, `fullscreen` |
| `window.width` | number | ❌ | Largura em pixels (padrão 420) |
| `window.height` | number | ❌ | Altura em pixels (padrão 680) |
| `window.minWidth` | number | ❌ | Largura mínima |
| `window.minHeight` | number | ❌ | Altura mínima |
| `window.resizable` | boolean | ❌ | Permitir redimensionar |
| `theme.mode` | enum | ✅ | `light`, `dark`, `auto` |
| `theme.primaryColor` | hex | ❌ | Cor primária (hex ou rgb) |
| `theme.secondaryColor` | hex | ❌ | Cor secundária |
| `theme.backgroundColor` | hex | ❌ | Fundo |
| `theme.textColor` | hex | ❌ | Texto |
| `behavior.autoOpen` | boolean | ❌ | Abrir automaticamente ao carregar |
| `behavior.showWelcome` | boolean | ❌ | Exibir mensagem de boas-vindas |
| `behavior.typingIndicator` | boolean | ❌ | Mostrar "digitando..." |
| `behavior.persistSession` | boolean | ❌ | Manter sessão após refresh |
| `capabilities.text` | boolean | ✅ | Enviar texto |
| `capabilities.file` | boolean | ✅ | Upload de arquivo |
| `capabilities.image` | boolean | ❌ | Upload de imagem |
| `capabilities.audio` | boolean | ❌ | Gravação de áudio |
| `capabilities.video` | boolean | ❌ | Gravação de vídeo |
| `session.timeoutSeconds` | number | ✅ | Timeout de inatividade (padrão 1800s = 30min) |
| `session.keepAlive` | boolean | ❌ | Enviar ping para manter sessão viva |

### Modo de Window

- **`embedded`**: Client dentro de um container no site (sem border)
- **`popup`**: Janela flutuante, canto inferior direito
- **`fullscreen`**: Tela cheia (mobile/desktop)

---

## 5. AIP - AltChat Interaction Protocol

AIP define os comandos que o servidor envia ao client para renderizar a conversação.

### Comandos Suportados no V1 MVP

| Comando | Finalidade | V1 MVP |
|---------|-----------|--------|
| `show_message` | Exibir mensagem simples | ✅ Obrigatório |
| `request_input` | Solicitar um campo | ✅ Obrigatório |
| `show_buttons` | Exibir botões de escolha | ✅ Obrigatório |
| `show_options` | Exibir lista de opções | ⏳ Opcional V1 |
| `show_form` | Exibir formulário com múltiplos campos | ✅ Obrigatório |
| `upload_file` | Solicitar upload de arquivo | ✅ Obrigatório |
| `wait` | Mostrar indicador de processamento | ✅ Obrigatório |
| `redirect` | Abrir URL externa/interna | ✅ Obrigatório |
| `clear` | Limpar conversa visualmente | ✅ Obrigatório |
| `close` | Encerrar sessão | ✅ Obrigatório |

---

## 5.1 show_message

Exibe uma mensagem simples do servidor.

```json
{
  "action": "show_message",
  "text": "Olá! Como posso ajudar?",
  "rich": false
}
```

**Campos:**
- `action` (string, obrigatório): `"show_message"`
- `text` (string, obrigatório): Conteúdo da mensagem
- `rich` (boolean, opcional): Se `true`, permite markdown básico

---

## 5.2 request_input

Solicita ao usuário que preencha um campo específico.

```json
{
  "action": "request_input",
  "text": "Informe seu CPF:",
  "field": {
    "name": "cpf",
    "label": "CPF",
    "type": "cpf",
    "required": true,
    "placeholder": "000.000.000-00",
    "mask": "(###) #####-##"
  }
}
```

**Campos:**
- `action` (string): `"request_input"`
- `text` (string): Pergunta exibida ao usuário
- `field` (object): Definição do campo
  - `name` (string): Identificador do campo (usado no evento)
  - `label` (string): Rótulo exibido
  - `type` (string): Tipo do campo (veja tabela abaixo)
  - `required` (boolean): Campo obrigatório?
  - `placeholder` (string): Texto de exemplo
  - `mask` (string, opcional): Máscara de entrada (para CPF, telefone, etc)
  - `minLength`, `maxLength` (number, opcional): Limites de tamanho
  - `pattern` (regex, opcional): Validação customizada

---

## 5.3 show_buttons

Exibe botões de escolha mutuamente exclusivos.

```json
{
  "action": "show_buttons",
  "text": "Escolha uma opção:",
  "buttons": [
    { "label": "Abrir chamado", "value": "open_ticket" },
    { "label": "Consultar chamado", "value": "check_ticket" },
    { "label": "Falar com atendente", "value": "talk_agent" }
  ]
}
```

**Campos:**
- `action` (string): `"show_buttons"`
- `text` (string): Pergunta ou contexto
- `buttons` (array): Lista de botões
  - `label` (string): Texto exibido no botão
  - `value` (string): Valor enviado no evento

**Evento enviado pelo client:**
```json
{
  "type": "button.clicked",
  "payload": { "value": "open_ticket" }
}
```

---

## 5.4 show_form

Exibe um formulário com múltiplos campos.

```json
{
  "action": "show_form",
  "text": "Preencha os dados do chamado:",
  "form": {
    "name": "ticket_form",
    "submitLabel": "Enviar Chamado",
    "cancelLabel": "Cancelar",
    "fields": [
      {
        "name": "subject",
        "label": "Assunto",
        "type": "text",
        "required": true,
        "placeholder": "Descreva brevemente"
      },
      {
        "name": "description",
        "label": "Descrição Completa",
        "type": "textarea",
        "required": true,
        "placeholder": "Forneça detalhes..."
      },
      {
        "name": "category",
        "label": "Categoria",
        "type": "select",
        "required": true,
        "options": [
          { "label": "Técnico", "value": "tech" },
          { "label": "Billing", "value": "billing" },
          { "label": "Outro", "value": "other" }
        ]
      }
    ]
  }
}
```

**Campos:**
- `action` (string): `"show_form"`
- `form` (object):
  - `name` (string): Identificador do formulário
  - `submitLabel` (string): Texto do botão de envio
  - `cancelLabel` (string, opcional): Texto do botão de cancelamento
  - `fields` (array): Array de campos (veja `request_input` para estrutura)

**Evento enviado pelo client:**
```json
{
  "type": "form.submitted",
  "payload": {
    "form": "ticket_form",
    "values": {
      "subject": "Sistema fora do ar",
      "description": "Não consigo acessar...",
      "category": "tech"
    }
  }
}
```

---

## 5.5 upload_file

Solicita ao usuário que faça upload de um arquivo.

```json
{
  "action": "upload_file",
  "text": "Anexe uma imagem do erro:",
  "file": {
    "accept": ["image/png", "image/jpeg", "application/pdf"],
    "maxSizeBytes": 5242880,
    "multiple": false
  }
}
```

**Campos:**
- `action` (string): `"upload_file"`
- `text` (string): Instrução ao usuário
- `file` (object):
  - `accept` (array): MIME types aceitos
  - `maxSizeBytes` (number): Tamanho máximo (padrão 5MB)
  - `multiple` (boolean): Permitir múltiplos arquivos?

**Evento enviado pelo client:**
```json
{
  "type": "file.uploaded",
  "payload": {
    "attachmentId": "att_123",
    "fileName": "erro.png",
    "mimeType": "image/png",
    "sizeBytes": 1024000
  }
}
```

---

## 5.6 wait

Exibe um indicador de processamento.

```json
{
  "action": "wait",
  "text": "Processando sua solicitação..."
}
```

---

## 5.7 redirect

Abre uma URL em nova aba ou redireciona.

```json
{
  "action": "redirect",
  "url": "https://www.exemplo.com/pagina",
  "target": "_blank",
  "message": "Abrindo documentação..."
}
```

**Campos:**
- `action` (string): `"redirect"`
- `url` (string): URL de destino
- `target` (string): `"_blank"` ou `"_self"`
- `message` (string, opcional): Mensagem antes de redirecionar

---

## 5.8 clear

Limpa o histórico de mensagens da conversação.

```json
{
  "action": "clear",
  "message": "Conversa resetada. Começamos de novo?"
}
```

---

## 5.9 close

Encerra a sessão e fecha o client.

```json
{
  "action": "close",
  "message": "Obrigado! Sua sessão foi encerrada."
}
```

---

## 6. Tipos de Campo

Para uso em `request_input` e `show_form`.

| Tipo | Uso | Entrada | Validação |
|------|-----|---------|-----------|
| `text` | Texto curto | Input simples | `required`, `minLength`, `maxLength`, `pattern` |
| `textarea` | Texto longo | Área de texto | `required`, `minLength`, `maxLength` |
| `email` | Email | Input + validação | RFC 5322 (básico) |
| `phone` | Telefone | Input + máscara | Máscara por país |
| `cpf` | CPF | Input + máscara | `###.###.###-##` |
| `cnpj` | CNPJ | Input + máscara | `##.###.###/####-##` |
| `number` | Número | Input numérico | `min`, `max`, `step` |
| `date` | Data | Input date | `YYYY-MM-DD` |
| `datetime` | Data e hora | Input datetime | ISO 8601 |
| `select` | Dropdown | Seleção única | `options` obrigatório |
| `radio` | Botões rádio | Seleção única | `options` obrigatório |
| `checkbox` | Checkboxes | Múltipla seleção | `options` obrigatório |
| `file` | Arquivo | File input | `accept`, `maxSizeBytes` |

### Exemplo de Campo Select

```json
{
  "name": "state",
  "label": "Estado",
  "type": "select",
  "required": true,
  "options": [
    { "label": "São Paulo", "value": "SP" },
    { "label": "Rio de Janeiro", "value": "RJ" },
    { "label": "Minas Gerais", "value": "MG" }
  ]
}
```

---

## 7. Eventos Client → Server

Eventos que o client envia para o servidor.

| Evento | Quando Ocorre | Payload |
|--------|---------------|---------|
| `session.started` | Client inicia uma sessão | `{ tenantId, clientId, externalUserId }` |
| `user.message` | Usuário envia texto livre | `{ text }` |
| `user.input` | Usuário preenche campo | `{ field, value }` |
| `button.clicked` | Usuário clica botão | `{ value }` |
| `option.selected` | Usuário escolhe opção | `{ value }` |
| `form.submitted` | Usuário envia formulário | `{ form, values }` |
| `file.uploaded` | Usuário envia arquivo | `{ attachmentId, fileName, mimeType, sizeBytes }` |
| `session.closed` | Usuário ou servidor encerra | `{ reason }` |
| `error.occurred` | Erro no client | `{ message, stack (opcional) }` |

### Exemplo Completo de Evento

```json
{
  "sessionId": "sess_123",
  "tenantId": "tenant_demo",
  "clientId": "default",
  "type": "form.submitted",
  "payload": {
    "form": "ticket_form",
    "values": {
      "subject": "Login não funciona",
      "description": "Recebo erro 401",
      "category": "tech"
    }
  },
  "timestamp": "2024-01-15T10:30:45Z"
}
```

---

## 8. Versionamento e Compatibilidade

### Regra de Versão

A V1 congela `protocol=ACPP version=1.0` e `protocol=AIP version=1.0`.

Novos comandos futuros devem ser:
1. **Opcionais** - clients antigos ignoram sem erro
2. **Backwards-compatible** - não quebram estrutura existente
3. **Versionados** - indicar em qual versão foram adicionados

### Estrutura de Compatibilidade

```json
{
  "protocol": "AIP",
  "version": "1.0",
  "sessionId": "sess_123",
  "compatibility": {
    "minClientVersion": "1.0.0"
  },
  "commands": [
    {
      "action": "show_message",
      "text": "Olá!"
    }
  ]
}
```

### Client Version Header

O client deve enviar sua versão no header:

```
X-AltChat-Client-Version: 1.0.0
```

---

## 9. Regras de Compatibilidade (Importante)

1. **Client ignora comandos desconhecidos**
   ```javascript
   if (unknownCommand) {
     console.warn(`Unknown command: ${command.action}`);
     // Continue sem erro
   }
   ```

2. **Servidor envia apenas comandos suportados**
   - Se conhecer versão do client, enviar apenas comandos compatíveis
   - Exemplo: Se client é v1.0, não enviar comandos v1.1

3. **Novos campos em estruturas existentes**
   - Devem ser opcionais
   - Cliente ignora campos desconhecidos
   - Exemplo: Adicionar `metadata` a `show_message` não quebra clients antigos

4. **Remoção de campos (nunca)**
   - Não remover campos obrigatórios
   - Apenas depreciar em versão N+1, remover em N+2

---

## 10. Fluxo Completo de Exemplo

### Servidor envia ACPP (inicial)

```json
{
  "protocol": "ACPP",
  "version": "1.0",
  "client": {
    "title": "Suporte Técnico",
    "avatarUrl": "https://exemplo.com/bot.png"
  },
  "window": { "mode": "popup", "width": 420 },
  "theme": { "mode": "light", "primaryColor": "#0066CC" },
  "behavior": { "autoOpen": false, "persistSession": true }
}
```

### Cliente cria sessão

```json
POST /api/v1/sessions
{
  "tenantId": "tenant_demo",
  "clientId": "default",
  "externalUserId": "user_123"
}
```

### Servidor responde com AIP (boas-vindas)

```json
{
  "protocol": "AIP",
  "version": "1.0",
  "sessionId": "sess_123",
  "commands": [
    {
      "action": "show_message",
      "text": "Bem-vindo ao Suporte! 👋"
    },
    {
      "action": "show_buttons",
      "text": "Como posso ajudar?",
      "buttons": [
        { "label": "Abrir Chamado", "value": "open" },
        { "label": "Consultar", "value": "check" }
      ]
    }
  ]
}
```

### Cliente envia evento

```json
POST /api/v1/events
{
  "sessionId": "sess_123",
  "tenantId": "tenant_demo",
  "clientId": "default",
  "type": "button.clicked",
  "payload": { "value": "open" }
}
```

### Servidor responde com mais AIP

```json
{
  "protocol": "AIP",
  "version": "1.0",
  "sessionId": "sess_123",
  "commands": [
    {
      "action": "request_input",
      "text": "Qual é o assunto do chamado?",
      "field": {
        "name": "subject",
        "label": "Assunto",
        "type": "text",
        "required": true
      }
    }
  ]
}
```

---

## 11. Checklist de Implementação do Client

- [ ] Parser ACPP e aplicação de tema
- [ ] Renderização de `show_message`
- [ ] Renderização de `request_input` com validação
- [ ] Renderização de `show_buttons`
- [ ] Renderização de `show_form` com multiplos campos
- [ ] Renderização de `upload_file`
- [ ] Renderização de `wait` com spinner
- [ ] Implementar `redirect` seguro
- [ ] Implementar `clear` (limpar histórico)
- [ ] Implementar `close` (fechar sessão)
- [ ] Enviar eventos com schema correto
- [ ] Gerenciar ciclo de vida de sessão
- [ ] Suporte a `persistSession` (localStorage)
- [ ] Tratamento de erros de rede
- [ ] Suporte a versioning (header `X-AltChat-Client-Version`)

---

**Documento gerado para implementação do AltChat V1 MVP**
