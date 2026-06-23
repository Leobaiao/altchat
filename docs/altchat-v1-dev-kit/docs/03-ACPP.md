# ACPP — AltChat Client Presentation Protocol

O ACPP controla a apresentação visual do client.

Ele define:

- título
- subtítulo
- avatar
- logo
- tema
- dimensões
- comportamento
- capacidades

## Exemplo completo

```json
{
  "client": {
    "title": "AltDesk Assistente",
    "subtitle": "Atendimento Online",
    "avatarUrl": "https://example.com/avatar.png",
    "logoUrl": "https://example.com/logo.png"
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
    "autoOpen": true,
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

## Campos

### client.title

Nome exibido no cabeçalho.

### client.subtitle

Texto secundário abaixo do título.

### client.avatarUrl

Avatar do chat ou atendente.

### window.mode

Valores:

- embedded
- popup
- fullscreen

### window.width

Largura em pixels.

### window.height

Altura em pixels.

### theme.mode

Valores:

- light
- dark
- auto

### behavior.autoOpen

Abre automaticamente o chat.

### capabilities.file

Habilita envio de arquivos.

### session.timeoutSeconds

Tempo de expiração da sessão.
