import { AltChatCommand, AltChatEvent } from "./protocol.js";
import { Session } from "./store.js";

/**
 * Represents a node in the visual flow editor.
 */
export interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

/**
 * Represents an edge (connection) in the visual flow editor.
 */
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

/**
 * Find the start node in the flow.
 */
function findStartNode(flow: FlowData): FlowNode | undefined {
  return flow.nodes.find(n => n.type === "start");
}

/**
 * Find a node by its ID.
 */
function findNodeById(flow: FlowData, nodeId: string): FlowNode | undefined {
  return flow.nodes.find(n => n.id === nodeId);
}

/**
 * Find the next node connected from a given source node.
 * If sourceHandle is provided, only follow that specific handle.
 */
function findNextNode(flow: FlowData, sourceId: string, sourceHandle?: string): FlowNode | undefined {
  const edge = flow.edges.find(e => {
    if (e.source !== sourceId) return false;
    if (sourceHandle && e.sourceHandle) {
      return e.sourceHandle === sourceHandle;
    }
    return true;
  });

  if (!edge) return undefined;
  return findNodeById(flow, edge.target);
}

/**
 * Generate the AltChatCommand[] for a given node.
 */
function generateCommandsForNode(node: FlowNode): AltChatCommand[] {
  const commands: AltChatCommand[] = [];

  switch (node.type) {
    case "message":
      commands.push({
        action: "show_message",
        text: node.data.text || "Mensagem sem texto configurado."
      });
      break;

    case "input":
      commands.push({
        action: "request_input",
        text: node.data.text || "Informe o dado solicitado:",
        field: {
          name: node.data.fieldName || "field",
          label: node.data.fieldLabel || "Campo",
          type: node.data.fieldType || "text",
          required: node.data.fieldRequired !== false,
          placeholder: node.data.fieldPlaceholder || ""
        }
      });
      break;

    case "buttons":
      commands.push({
        action: "show_buttons",
        text: node.data.text || "Escolha uma opção:",
        buttons: (node.data.buttons || []).map((b: any) => ({
          label: b.label || "Botão",
          value: b.value || b.label || "btn"
        }))
      });
      break;

    case "form":
      commands.push({
        action: "show_form",
        text: node.data.text || "Preencha o formulário:",
        form: {
          name: node.data.formName || "form",
          submitLabel: node.data.submitLabel || "Enviar",
          fields: (node.data.fields || []).map((f: any) => ({
            name: f.name || "field",
            label: f.label || "Campo",
            type: f.type || "text",
            required: f.required !== false,
            placeholder: f.placeholder || ""
          }))
        }
      });
      break;

    case "redirect":
      commands.push({
        action: "redirect",
        url: node.data.url || "https://example.com"
      });
      break;

    case "wait":
      commands.push({
        action: "wait",
        text: node.data.text || "Aguarde..."
      });
      break;

    case "close":
      commands.push({
        action: "close",
        text: node.data.text || "Conversa encerrada. Obrigado!"
      });
      break;

    default:
      commands.push({
        action: "show_message",
        text: `Nó desconhecido: ${node.type}`
      });
  }

  return commands;
}

/**
 * Walk through sequential non-interactive nodes (message, wait, redirect)
 * and collect their commands until we reach an interactive node or the end.
 */
function collectSequentialCommands(flow: FlowData, startNode: FlowNode): { commands: AltChatCommand[]; lastNodeId: string } {
  const commands: AltChatCommand[] = [];
  let currentNode: FlowNode | undefined = startNode;

  while (currentNode) {
    commands.push(...generateCommandsForNode(currentNode));

    // Interactive nodes (input, buttons, form) stop the chain — we wait for user response
    if (["input", "buttons", "form", "close"].includes(currentNode.type)) {
      return { commands, lastNodeId: currentNode.id };
    }

    // Non-interactive nodes: follow to the next
    const nextNode = findNextNode(flow, currentNode.id);
    if (!nextNode) {
      return { commands, lastNodeId: currentNode.id };
    }
    currentNode = nextNode;
  }

  return { commands, lastNodeId: startNode.id };
}

/**
 * Process the initial start of a dynamic flow.
 */
export function startDynamicFlow(session: Session, flow: FlowData): AltChatCommand[] {
  const startNode = findStartNode(flow);
  if (!startNode) {
    return [{ action: "show_message", text: "Fluxo não possui nó de início configurado." }];
  }

  // From the start node, go to the first connected node
  const firstNode = findNextNode(flow, startNode.id);
  if (!firstNode) {
    return [{ action: "show_message", text: "Fluxo vazio — nenhum nó conectado ao início." }];
  }

  const { commands, lastNodeId } = collectSequentialCommands(flow, firstNode);
  session.state = `flow:${lastNodeId}`;
  return commands;
}

/**
 * Handle an event within a dynamic flow.
 */
export function handleDynamicEvent(session: Session, event: AltChatEvent, flow: FlowData): AltChatCommand[] {
  // Extract current node ID from session state
  const statePrefix = "flow:";
  if (!session.state.startsWith(statePrefix)) {
    // Not in a dynamic flow state — shouldn't happen but return fallback
    return [{ action: "show_message", text: "Estado de sessão inválido para o fluxo dinâmico." }];
  }

  const currentNodeId = session.state.slice(statePrefix.length);
  const currentNode = findNodeById(flow, currentNodeId);

  if (!currentNode) {
    return [{ action: "show_message", text: "Nó do fluxo não encontrado. O fluxo pode ter sido alterado." }];
  }

  let nextNode: FlowNode | undefined;

  // Determine the next node based on the event type and current node
  if (event.type === "button.clicked" && currentNode.type === "buttons") {
    const clickedValue = String((event.payload || {}).value || "");
    // Find the button that matches and use its handle
    const buttons: any[] = currentNode.data.buttons || [];
    const btnIndex = buttons.findIndex((b: any) => b.value === clickedValue || b.label === clickedValue);
    const handleId = btnIndex >= 0 ? `btn-${btnIndex}` : undefined;
    nextNode = findNextNode(flow, currentNodeId, handleId);

    // Fallback: try default edge if specific handle not found
    if (!nextNode) {
      nextNode = findNextNode(flow, currentNodeId);
    }
  } else if (event.type === "user.input" && currentNode.type === "input") {
    // Save the input value to session data
    const fieldName = currentNode.data.fieldName || "field";
    const value = (event.payload || {}).value;
    session.data[fieldName] = value;
    nextNode = findNextNode(flow, currentNodeId);
  } else if (event.type === "form.submitted" && currentNode.type === "form") {
    // Save form values
    const values = (event.payload || {}).values || {};
    session.data = { ...session.data, ...values };
    nextNode = findNextNode(flow, currentNodeId);
  } else if (event.type === "user.message") {
    // Free text: just advance to next node from current
    nextNode = findNextNode(flow, currentNodeId);
  } else {
    // Unknown event for this node type — try to advance anyway
    nextNode = findNextNode(flow, currentNodeId);
  }

  if (!nextNode) {
    return [{
      action: "show_message",
      text: "Fim do fluxo — nenhuma transição configurada para esta etapa."
    }];
  }

  const { commands, lastNodeId } = collectSequentialCommands(flow, nextNode);
  session.state = `flow:${lastNodeId}`;
  return commands;
}
