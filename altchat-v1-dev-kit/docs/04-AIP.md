# AIP — AltChat Interaction Protocol

O AIP é a linguagem de comandos entre Server Application e AltChat Client.

## Estrutura de resposta

```json
{
  "sessionId": "sess_123",
  "commands": []
}
```

## Comandos oficiais

### show_message

Exibe mensagem simples.

```json
{
  "action": "show_message",
  "text": "Olá! Como posso ajudar?"
}
```

### request_input

Solicita uma entrada.

```json
{
  "action": "request_input",
  "text": "Informe seu CPF:",
  "field": {
    "name": "cpf",
    "type": "cpf",
    "required": true,
    "placeholder": "000.000.000-00"
  }
}
```

### show_buttons

Mostra botões de ação.

```json
{
  "action": "show_buttons",
  "text": "Escolha uma opção:",
  "buttons": [
    { "label": "Abrir chamado", "value": "open_ticket" },
    { "label": "Consultar chamado", "value": "check_ticket" }
  ]
}
```

### show_form

Mostra formulário completo.

```json
{
  "action": "show_form",
  "text": "Preencha os dados do chamado:",
  "form": {
    "name": "ticket_form",
    "submitLabel": "Enviar",
    "fields": [
      { "name": "subject", "label": "Assunto", "type": "text", "required": true },
      { "name": "description", "label": "Descrição", "type": "textarea", "required": true }
    ]
  }
}
```

### upload_file

Solicita arquivo.

```json
{
  "action": "upload_file",
  "text": "Anexe um arquivo, se desejar:",
  "accept": ["image/*", "application/pdf"],
  "required": false
}
```

### wait

Mostra processamento.

```json
{
  "action": "wait",
  "text": "Consultando informações..."
}
```

### redirect

Redireciona o usuário.

```json
{
  "action": "redirect",
  "url": "https://empresa.com/ticket/123"
}
```

### clear

Limpa visualmente a conversa.

```json
{
  "action": "clear"
}
```

### close

Encerra a sessão.

```json
{
  "action": "close",
  "text": "Atendimento encerrado."
}
```

## Tipos de campo

- text
- email
- phone
- cpf
- cnpj
- number
- date
- datetime
- textarea
- select
- radio
- checkbox
- file

## Eventos Client → Server

### session.started

```json
{
  "type": "session.started",
  "sessionId": "sess_123",
  "tenantId": "tenant_demo"
}
```

### user.message

```json
{
  "type": "user.message",
  "sessionId": "sess_123",
  "payload": {
    "text": "oi"
  }
}
```

### user.input

```json
{
  "type": "user.input",
  "sessionId": "sess_123",
  "payload": {
    "field": "cpf",
    "value": "12345678900"
  }
}
```

### button.clicked

```json
{
  "type": "button.clicked",
  "sessionId": "sess_123",
  "payload": {
    "value": "open_ticket"
  }
}
```

### form.submitted

```json
{
  "type": "form.submitted",
  "sessionId": "sess_123",
  "payload": {
    "form": "ticket_form",
    "values": {
      "subject": "Erro de login",
      "description": "Não consigo acessar o sistema."
    }
  }
}
```
