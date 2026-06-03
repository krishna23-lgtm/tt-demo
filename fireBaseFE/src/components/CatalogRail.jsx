import { Check, Play } from "lucide-react";

export default function CatalogRail({ title, titles, selectedId, onSelect }) {
  return (
    <section className="catalog-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="catalog-grid">
        {titles.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button className={`title-card ${selected ? "selected" : ""}`} key={item.id} type="button" onClick={() => onSelect(item.id)}>
              <span className="poster-wrap">
                <img src={item.posterUrl} alt="" loading="lazy" />
                <span className="provider-tag">{item.provider}</span>
                <span className="play-chip">
                  {selected ? <Check size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                </span>
              </span>
              <span className="title-card-body">
                <strong>{item.title}</strong>
                <span>{item.language} · {item.genre} · {item.durationLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
