import { MonitorPlay, Play, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import AppNav from "../components/AppNav";
import CatalogGrid from "../components/CatalogGrid";
import CreateRoomForm from "../components/CreateRoomForm";
import { contentRails, getContentById, ottCatalog, providerBadges, titlesForRail } from "../data/catalog";

export default function BrowsePage({ onCreate }) {
  const [selectedId, setSelectedId] = useState(ottCatalog[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedTitle = useMemo(() => getContentById(selectedId), [selectedId]);

  const create = async (payload) => {
    setLoading(true);
    setError("");
    try {
      await onCreate(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="browse-layout xstream-home">
      <header className="page-header xstream-topbar">
        <div className="brand-lockup">
          <span className="brand-icon">
            <MonitorPlay size={28} aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow">TechTank Play</span>
            <h1>Xstream Rooms</h1>
          </div>
        </div>
        <AppNav />
      </header>

      {error && <div className="banner error">{error}</div>}

      <section className="xstream-hero" style={{ "--hero-image": `url(${selectedTitle.posterUrl})` }}>
        <div className="hero-content">
          <span className="hero-kicker">
            <Sparkles size={16} aria-hidden="true" />
            Watch together across web and mobile
          </span>
          <h2>{selectedTitle.title}</h2>
          <div className="hero-meta">
            <span>{selectedTitle.provider}</span>
            <span>{selectedTitle.year}</span>
            <span>{selectedTitle.rating}</span>
            <span>{selectedTitle.language}</span>
            <span>{selectedTitle.durationLabel}</span>
          </div>
          <p>{selectedTitle.synopsis}</p>
          <div className="hero-actions">
            <button className="hero-play" type="button" onClick={() => setSelectedId(selectedTitle.id)}>
              <Play size={18} aria-hidden="true" />
              Selected
            </button>
            <span className="plan-chip">{selectedTitle.plan}</span>
          </div>
        </div>

        <aside className="create-room-panel hero-create-panel">
          <span className="eyebrow">Create private room</span>
          <CreateRoomForm movie={selectedTitle} onCreate={create} loading={loading} />
        </aside>
      </section>

      <section className="provider-ribbon" id="otts" aria-label="OTT partners">
        {providerBadges.map((provider) => (
          <span key={provider}>{provider}</span>
        ))}
      </section>

      <section className="browse-rails" id="search">
        <CatalogGrid title="Featured movies and shows" titles={ottCatalog} selectedId={selectedId} onSelect={setSelectedId} />
        {contentRails.map((rail) => (
          <CatalogGrid
            compact
            key={rail.title}
            title={rail.title}
            titles={titlesForRail(rail.ids)}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </section>
    </main>
  );
}
