import { LogIn, MonitorPlay, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import AppNav from "../components/AppNav";

export default function JoinPage({ presetRoomId = "", onJoin }) {
  const [roomId, setRoomId] = useState(presetRoomId);
  const [userName, setUserName] = useState("Aman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRoomId(presetRoomId);
  }, [presetRoomId]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onJoin({ roomId: roomId.trim().toUpperCase(), userName: userName.trim() || "Guest" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="entry-layout">
      <section className="entry-shell">
        <div className="brand-lockup">
          <span className="brand-icon">
            <MonitorPlay size={28} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Watch together</span>
            <h1>Join Room</h1>
          </div>
        </div>
        <AppNav />
        {error && <div className="banner error">{error}</div>}
        <form className="entry-form" onSubmit={submit}>
          <label>
            Room code
            <input value={roomId} onChange={(event) => setRoomId(event.target.value.toUpperCase())} placeholder="ABCD1234" required maxLength={8} />
          </label>
          <label>
            Your name
            <input value={userName} onChange={(event) => setUserName(event.target.value)} required maxLength={80} />
          </label>
          <button className="primary-action" type="submit" disabled={loading}>
            {loading ? <span className="button-spinner" aria-hidden="true" /> : <LogIn size={17} aria-hidden="true" />}
            {loading ? "Joining room" : "Join room"}
          </button>
        </form>
        <div className="trust-row">
          <span>
            <ShieldCheck size={16} aria-hidden="true" />
            Guest access
          </span>
          <span>Live room sync</span>
        </div>
      </section>
      <section className="entry-preview">
        <div className="preview-screen">
          <div className="preview-chip">ROOM</div>
          <div className="preview-title">{roomId || "ABCD1234"}</div>
          <div className="preview-meta">
            <span>Play</span>
            <span>Chat</span>
            <span>React</span>
          </div>
        </div>
      </section>
    </main>
  );
}
