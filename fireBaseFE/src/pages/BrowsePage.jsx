import { Clock, MonitorPlay, Play, RadioTower, Sparkles, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import AppNav from "../components/AppNav";
import CatalogRail from "../components/CatalogRail";
import { getContentById, ottCatalog } from "../data/catalog";

export default function BrowsePage({ onCreate }) {
  const [selectedId, setSelectedId] = useState(ottCatalog[0].id);
  const [userName, setUserName] = useState("Ram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedTitle = useMemo(() => getContentById(selectedId), [selectedId]);
  const selectedIndex = ottCatalog.findIndex((item) => item.id === selectedId);
  const watchCount = `${42 + Math.max(selectedIndex, 0) * 18}K watching`;

  const create = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onCreate({ movieId: selectedId, userName: userName.trim() || "Guest" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="browse-layout">
      <header className="page-header">
        <div className="brand-lockup">
          <span className="brand-icon">
            <MonitorPlay size={28} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">Watch together</span>
            <h1>TechTank Play</h1>
          </div>
        </div>
        <AppNav />
      </header>

      {error && <div className="banner error">{error}</div>}

      <section className="hero" style={{ "--hero-image": `url(${selectedTitle.posterUrl})` }}>
        <span className="watch-along-badge">
          <Users size={15} aria-hidden="true" />
          Watch Along
        </span>
        <div className="hero-content">
          <span className="hero-kicker">
            <Sparkles size={16} aria-hidden="true" />
            Featured watch party
          </span>
          <h2>{selectedTitle.title}</h2>
          <div className="hero-meta">
            <span>{selectedTitle.provider}</span>
            <span>{selectedTitle.year}</span>
            <span>{selectedTitle.rating}</span>
            <span>{selectedTitle.language}</span>
          </div>
          <p>{selectedTitle.synopsis}</p>
          <div className="hero-actions">
            <button className="hero-play" type="button" onClick={() => document.getElementById("room-create")?.scrollIntoView({ behavior: "smooth" })}>
              <Play size={18} aria-hidden="true" />
              Watch Together
            </button>
            <span className="hero-signal">
              <Users size={17} aria-hidden="true" />
              {watchCount}
            </span>
          </div>
          <div className="detail-badges" aria-label="Title details">
            {[selectedTitle.genre, selectedTitle.durationLabel, selectedTitle.language, selectedTitle.rating].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <form className="create-panel" id="room-create" onSubmit={create}>
          <span className="eyebrow">Host a room</span>
          <strong>{selectedTitle.title}</strong>
          <p>{selectedTitle.provider} · {selectedTitle.durationLabel}</p>
          <label>
            Your name
            <input value={userName} onChange={(event) => setUserName(event.target.value)} required maxLength={80} />
          </label>
          <button className="primary-action" type="submit" disabled={loading}>
            {loading && <span className="button-spinner" aria-hidden="true" />}
            {loading ? "Creating room" : "Create room"}
          </button>
        </form>
      </section>

      <section className="selected-detail" aria-label="Selected title">
        <img src={selectedTitle.posterUrl} alt="" loading="lazy" />
        <div>
          <span className="eyebrow">Now selected</span>
          <h2>{selectedTitle.title}</h2>
          <p>{selectedTitle.synopsis}</p>
          <div className="selected-metrics">
            <span>
              <Star size={15} aria-hidden="true" />
              {selectedTitle.rating}
            </span>
            <span>
              <Clock size={15} aria-hidden="true" />
              {selectedTitle.durationLabel}
            </span>
            <span>
              <RadioTower size={15} aria-hidden="true" />
              {selectedTitle.provider}
            </span>
          </div>
        </div>
      </section>

      <section className="provider-ribbon" id="providers" aria-label="OTT partners">
        <span className="ribbon-title">
          <RadioTower size={17} aria-hidden="true" />
          Live partners
        </span>
        {["Prime Video", "Netflix", "Sony LIV", "JioHotstar", "Amazon MX Player", "Lionsgate Play", "SunNXT"].map((provider) => (
          <span key={provider}>{provider}</span>
        ))}
      </section>

      <div className="browse-rails" id="catalog">
        <CatalogRail title="Featured movies and shows" titles={ottCatalog} selectedId={selectedId} onSelect={setSelectedId} />
        <CatalogRail title="Trending watch parties" titles={[...ottCatalog].reverse()} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </main>
  );
}
