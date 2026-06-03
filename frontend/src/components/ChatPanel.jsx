import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, user, roomId, onSend }) {
  const [message, setMessage] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const submit = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    onSend({
      roomId,
      userId: user.userId,
      userName: user.userName,
      message: trimmed
    });
    setMessage("");
  };

  return (
    <section className="panel chat-panel">
      <div className="panel-heading">
        <span>
          <MessageCircle size={17} aria-hidden="true" />
          Chat
        </span>
        <strong>{messages.length}</strong>
      </div>

      <div className="chat-list" ref={scrollerRef}>
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet</div>
        ) : (
          messages.map((chat) => (
            <div className={`chat-bubble ${chat.userId === user.userId ? "self" : ""}`} key={chat.id || `${chat.userId}-${chat.timestamp}`}>
              <span>{chat.userName}</span>
              <p>{chat.message}</p>
            </div>
          ))
        )}
      </div>

      <form className="chat-input-row" onSubmit={submit}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message"
          maxLength={1000}
          aria-label="Message"
        />
        <button className="icon-button send-button" type="submit" title="Send message">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
