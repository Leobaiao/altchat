# Estado Atual do Projeto — AltChat

Este documento apresenta o status atual de desenvolvimento do AltChat V1 MVP, detalhando o que já foi construído, testado e empacotado, além de listar os próximos passos de implementação para futuras versões (V2/V3) e melhorias de produção.

---

## 🛠️ O Que Já Foi Implementado (MVP V1 Concluído)

O MVP da V1 foi totalmente implementado com base na arquitetura monorepo proposta e nos protocolos de comunicação desenhados.

### 1. Infraestrutura & Banco de Dados
* **Monorepo Estruturado:** Configurado com Turborepo e workspaces do npm.
  * `apps/api`: Backend REST.
  * `apps/console`: Painel Administrativo.
  * `apps/demo`: Página de teste de integração.
  * `packages/client`: Script do Widget (`altchat.js`).
  * `packages/protocol`: Tipagem TypeScript do protocolo.
* **Persistência PostgreSQL & ORM:** Banco relacional usando Prisma ORM com os modelos de dados para `Tenant`, `Client`, `Session`, `Event`, `Command`, `ApiKey` e `AuditLog`.
* **Seed Script de Inicialização:** Script pronto para criar dados de demonstração (Tenant demo, cliente ativo, API Key configurada e tema ACPP inicial).
* **Dockerização Completa:** `Dockerfile` para a API e o Console + `docker-compose.yml` unificando PostgreSQL, API e Console.

### 2. Protocolos ACPP & AIP
* **ACPP (Apresentação):** Sistema de temas dinâmicos injetado no widget a partir das CSS Variables cadastradas no backend.
* **AIP (Interação):** Renderizador dos 8 comandos essenciais de chat no client:
  1. `show_message` (Mensagens de texto do bot/sistema)
  2. `request_input` (Inputs validados de texto, CPF, e-mail, etc.)
  3. `show_buttons` (Opções de múltipla escolha por botões)
  4. `show_form` (Formulários estruturados multi-campo)
  5. `upload_file` (Interface de upload)
  6. `wait` (Feedback visual de digitação/processamento)
  7. `redirect` (Redirecionamento do usuário final)
  8. `clear` / `close` (Limpeza de histórico e encerramento de sessão)
* **Motor de Fluxo (Flow Engine):** Lógica no backend que gerencia o estado da sessão baseado em um fluxo interativo pré-configurado.

### 3. Segurança & Resiliência
* **Autenticação Baseada em API Key:** Validação com cabeçalho `X-AltChat-Api-Key` usando hash seguro (`SHA-256`) no banco.
* **Filtro Multi-tenant no Middleware:** Isolamento rigoroso garantindo que transações ou dados de um Tenant nunca vazem para outros.
* **Rate Limiting:** Proteção ativa limitando requisições em 100 req/min por API Key.
* **Log de Auditoria:** Gravação de ações administrativas para auditoria interna.

### 4. Distribuição & Painéis
* **Widget Embutível (`altchat.js`):** Script encapsulado em Web Component nativo usando Shadow DOM, permitindo integração fácil e sem conflito de CSS com sites terceiros.
* **Console Administrativo (Dashboard):** Dashboard em React expondo KPIs essenciais (sessões abertas/fechadas, contagem de eventos, chaves ativas, painel de depuração de mensagens).

---

## 🔲 O Que Ainda Precisa Ser Implementado (Roadmap V2/V3)

Para expandir o AltChat além de um MVP funcional e torná-lo um produto pronto para escala em produção, as seguintes frentes de trabalho precisam ser implementadas:

### 1. Storage Real de Arquivos (Integração com MinIO / S3)
* **Status no MVP:** Simulação local em Base64.
* **Falta Fazer:**
  - Implementar o upload real para o MinIO (local em desenvolvimento) ou AWS S3 (em nuvem).
  - Gerar URLs assinadas temporárias para exibição segura dos anexos no chat e no console administrativo.

### 2. Designer Visual de Fluxos (Drag-and-Drop)
* **Status no MVP:** Fluxos definidos via código no `flowEngine.ts`.
* **Falta Fazer:**
  - Criar um construtor visual de fluxos (ex: utilizando React Flow) na interface do Console.
  - Salvar a árvore de decisão do fluxo em formato JSON no banco de dados e ler dinamicamente na API durante a execução da sessão.

### 3. Dashboard Administrativo Multi-tenant & JWT Auth
* **Status no MVP:** Console administrativo acessível globalmente/simplificado.
* **Falta Fazer:**
  - Login completo para administradores de tenants usando JWT (JSON Web Tokens).
  - Telas de convites de novos usuários e gerenciamento de perfis de acesso (ex: admin, operador, visualizador).

### 4. SDK React Oficial & Bibliotecas Client Avançadas
* **Status no MVP:** Widget genérico em Web Component.
* **Falta Fazer:**
  - Desenvolver o pacote `@altchat/react` contendo Hooks (ex: `useAltChat`) e componentes React nativos para maior flexibilidade em aplicações modernas.

### 5. Motor de Chat Inteligente (Integração com IA / LLMs)
* **Status no MVP:** Lógica baseada em regras estáticas (State Machine).
* **Falta Fazer:**
  - Adicionar suporte a processamento de linguagem natural (NLP).
  - Integrar APIs de LLMs (ex: OpenAI, Gemini) para que possam guiar a conversa e preencher campos do AIP dinamicamente se o usuário sair do roteiro pré-definido.

### 6. Suporte Multicanal
* **Status no MVP:** Chat Web Widget exclusivo.
* **Falta Fazer:**
  - Criar conectores para canais de mensagens externos, permitindo rodar a mesma árvore de comandos AIP via WhatsApp Business, Telegram e Facebook Messenger.

### 7. Monitoramento, Observabilidade & CI/CD
* **Status no MVP:** Logs simples de console e auditoria in-db.
* **Falta Fazer:**
  - Integrar ferramentas de observabilidade (ex: Prometheus + Grafana ou Datadog) para monitoramento de latência da API.
  - Configurar pipelines de integração contínua (CI/CD) para deploy automatizado na AWS, GCP ou Azure.
