import { useState } from "react";
import { ChatApp, ChatAppProps } from "./ChatApp";
import { MessageSquare, X } from "lucide-react";

export function Widget(props: ChatAppProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="altchat-widget-container">
      <div className={`altchat-window-wrapper ${isOpen ? "open" : "closed"}`}>
        <ChatApp {...props} />
      </div>

      <button 
        className="altchat-fab" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
