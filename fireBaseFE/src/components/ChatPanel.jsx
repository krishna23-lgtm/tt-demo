import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend, uid, variant = "panel", onClose }) {
  const [message, setMessage] = useState("");
  const scrollerRef = useRef(null);
  const overlay = variant === "overlay";
  const dock = variant === "dock";

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    onSend(trimmed);
    setMessage("");
  };

  return (
    <section className={`panel chat-panel ${overlay ? "chat-overlay-panel" : ""} ${dock ? "chat-dock-panel" : ""}`} onClick={(event) => event.stopPropagation()}>
      <div className="panel-heading chat-heading">
        <span>
          <MessageCircle size={17} aria-hidden="true" />
          Chat
        </span>
        <div className="chat-heading-actions">
          <strong>{messages.length}</strong>
          {onClose && (
            <button className="chat-close-button" type="button" onClick={onClose} title="Close chat">
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="chat-list" ref={scrollerRef}>
        {messages.length === 0 ? <div className="empty-state">No messages yet</div> : messages.map((item) => (
          <div className={`chat-bubble ${item.userId === uid ? "me" : "them"}`} key={item.id}>
            <span>{item.userName}</span>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={submit}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" aria-label="Message" />
        <button className="icon-button send-button" type="submit" title="Send message">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
