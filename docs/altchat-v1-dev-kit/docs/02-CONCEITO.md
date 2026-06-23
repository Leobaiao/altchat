# Conceito do AltChat

AltChat é um mecanismo de conversação Client/Server.

## O que ele faz

- Captura texto digitado pelo usuário
- Captura inputs estruturados
- Envia eventos para o servidor
- Recebe comandos do servidor
- Renderiza mensagens, campos, botões, formulários e ações

## O que ele não faz

- Não executa regra de negócio
- Não decide fluxos sozinho
- Não substitui o AltDesk
- Não é NUUVO
- Não é WhatsApp
- Não é um help desk

## Separação de responsabilidades

### Aplicação Server-Side

Responsável por:

- fluxo
- regras
- integrações
- validações
- persistência
- decisões

### AltChat Client

Responsável por:

- interface
- captura de dados
- execução de comandos
- eventos de usuário
- experiência conversacional

## Exemplo

```text
Usuário informa CPF
↓
AltChat envia evento user.input
↓
Servidor valida CPF
↓
Servidor responde com show_buttons
↓
AltChat exibe opções
```
