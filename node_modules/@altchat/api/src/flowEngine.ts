import { AltChatCommand, AltChatEvent } from "./protocol.js";
import { Session } from "./store.js";

export function startCommands(session: Session): AltChatCommand[] {
  session.state = "waiting_name";

  return [
    {
      action: "show_message",
      text: "Olá! Eu sou o AltChat. Este client executa instruções enviadas pelo servidor."
    },
    {
      action: "request_input",
      text: "Para começar, informe seu nome:",
      field: {
        name: "name",
        label: "Nome",
        type: "text",
        required: true,
        placeholder: "Digite seu nome"
      }
    }
  ];
}

export function handleEvent(session: Session, event: AltChatEvent): AltChatCommand[] {
  const payload = event.payload || {};

  if (event.type === "user.message") {
    const text = String(payload.text || "").toLowerCase();

    if (text.includes("limpar")) {
      return [{ action: "clear" }, ...startCommands(session)];
    }

    return [
      {
        action: "show_message",
        text: "Recebi sua mensagem. Neste MVP, o servidor conduz o fluxo por inputs e botões."
      },
      {
        action: "show_buttons",
        text: "Escolha uma opção:",
        buttons: [
          { label: "Abrir chamado", value: "open_ticket" },
          { label: "Consultar chamado", value: "check_ticket" },
          { label: "Reiniciar", value: "restart" }
        ]
      }
    ];
  }

  if (event.type === "user.input") {
    const field = String(payload.field || "");
    const value = String(payload.value || "");

    if (field === "name") {
      session.data.name = value;
      session.state = "waiting_cpf";

      return [
        { action: "show_message", text: `Prazer, ${value}.` },
        {
          action: "request_input",
          text: "Agora informe seu CPF:",
          field: {
            name: "cpf",
            label: "CPF",
            type: "cpf",
            required: true,
            placeholder: "000.000.000-00"
          }
        }
      ];
    }

    if (field === "cpf") {
      session.data.cpf = value;
      session.state = "menu";

      return [
        { action: "show_message", text: "CPF recebido. O servidor poderia agora consultar uma API externa." },
        {
          action: "show_buttons",
          text: "Como posso ajudar?",
          buttons: [
            { label: "Abrir chamado", value: "open_ticket" },
            { label: "Consultar chamado", value: "check_ticket" },
            { label: "Enviar arquivo", value: "send_file" },
            { label: "Testar Wait", value: "test_wait" },
            { label: "Testar Redirect", value: "test_redirect" },
            { label: "Encerrar", value: "close" }
          ]
        }
      ];
    }
  }

  if (event.type === "button.clicked") {
    const value = String(payload.value || "");

    if (value === "restart") {
      session.data = {};
      return [{ action: "clear" }, ...startCommands(session)];
    }

    if (value === "test_wait") {
      return [
        { action: "wait", text: "Simulando processamento..." },
        { action: "show_message", text: "Isso testa o comando wait (que no cliente atual apenas exibe a mensagem de aguarde)." },
        {
          action: "show_buttons",
          text: "Deseja fazer mais alguma coisa?",
          buttons: [
            { label: "Menu Principal", value: "restart" },
            { label: "Encerrar", value: "close" }
          ]
        }
      ];
    }

    if (value === "test_redirect") {
      return [
        { action: "show_message", text: "Enviando comando de redirecionamento para uma nova aba..." },
        { action: "redirect", url: "https://www.google.com" },
        {
          action: "show_buttons",
          text: "Deseja fazer mais alguma coisa?",
          buttons: [
            { label: "Menu Principal", value: "restart" },
            { label: "Encerrar", value: "close" }
          ]
        }
      ];
    }

    if (value === "open_ticket") {
      session.state = "ticket_form";

      return [
        {
          action: "show_form",
          text: "Preencha os dados para abertura do chamado:",
          form: {
            name: "ticket_form",
            submitLabel: "Abrir chamado",
            fields: [
              {
                name: "subject",
                label: "Assunto",
                type: "text",
                required: true,
                placeholder: "Ex: Erro de login"
              },
              {
                name: "priority",
                label: "Prioridade",
                type: "select",
                required: true,
                options: [
                  { label: "Baixa", value: "low" },
                  { label: "Média", value: "medium" },
                  { label: "Alta", value: "high" },
                  { label: "Crítica", value: "critical" }
                ]
              },
              {
                name: "description",
                label: "Descrição",
                type: "textarea",
                required: true,
                placeholder: "Descreva o problema"
              }
            ]
          }
        }
      ];
    }

    if (value === "send_file") {
      return [
        {
          action: "request_input",
          text: "Selecione o arquivo que deseja enviar para o servidor:",
          field: {
            name: "attachment",
            label: "Enviar arquivo",
            type: "file",
            required: true
          }
        }
      ];
    }

    if (value === "check_ticket") {
      return [
        {
          action: "request_input",
          text: "Informe o número do chamado:",
          field: {
            name: "ticketNumber",
            label: "Número do chamado",
            type: "text",
            required: true,
            placeholder: "Ex: TK-000123"
          }
        }
      ];
    }

    if (value === "close") {
      session.state = "closed";
      return [{ action: "close", text: "Conversa encerrada. Obrigado." }];
    }
  }

  if (event.type === "file.uploaded") {
    return [
      { action: "show_message", text: `Arquivo recebido com sucesso! ID temporário: ${payload.attachmentId}` },
      {
        action: "show_buttons",
        text: "Deseja fazer mais alguma coisa?",
        buttons: [
          { label: "Abrir chamado", value: "open_ticket" },
          { label: "Encerrar", value: "close" }
        ]
      }
    ];
  }

  if (event.type === "form.submitted") {
    const values = payload.values || {};
    session.data.ticket = values;
    session.state = "menu";

    const ticketId = `TK-${Math.floor(Math.random() * 900000 + 100000)}`;

    return [
      { action: "show_message", text: `Chamado criado com sucesso: ${ticketId}` },
      {
        action: "show_buttons",
        text: "Deseja fazer mais alguma coisa?",
        buttons: [
          { label: "Abrir outro chamado", value: "open_ticket" },
          { label: "Encerrar", value: "close" }
        ]
      }
    ];
  }

  if (event.type === "session.closed") {
    session.state = "closed";
    return [{ action: "close", text: "Sessão encerrada." }];
  }

  return [
    {
      action: "show_message",
      text: "Evento recebido, mas não existe regra configurada para este estado."
    }
  ];
}
