import { MonitorPlay } from "lucide-react";
import { useState } from "react";
import AppNav from "../components/AppNav";
import JoinRoomForm from "../components/JoinRoomForm";

export default function JoinPage({ presetRoomId = "", onJoin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const join = async (payload) => {
    setLoading(true);
    setError("");
    try {
      await onJoin(payload);
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
            <span className="eyebrow">TechTank Play</span>
            <h1>Join Xstream Room</h1>
          </div>
        </div>

        <AppNav />

        {error && <div className="banner error">{error}</div>}
        <JoinRoomForm initialRoomId={presetRoomId} onJoin={join} loading={loading} />
      </section>

      <section className="entry-preview" aria-label="Live room preview">
        <div className="preview-screen">
          <div className="preview-chip">SYNC</div>
          <div className="preview-title">{presetRoomId || "ABCD1234"}</div>
          <div className="preview-bars">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}
