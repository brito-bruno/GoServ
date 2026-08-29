export default function MenuItemCard({ item, priceLabel, onAdd }) {
  return (
    <article className="menu-card">
      <div className="media">
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.name} loading="lazy" />
        ) : (
          <div className="placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="body">
        <div className="top">
          <h2>{item.name}</h2>
          <span className="price">{priceLabel}</span>
        </div>
        {item.description && <p>{item.description}</p>}
        <button type="button" className="add" onClick={() => onAdd?.(item)}>
          Adicionar
        </button>
      </div>

      <style>{`
        .menu-card {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 0.9rem;
          padding: 0.85rem;
          background: linear-gradient(145deg, var(--surface), var(--bg-elevated));
          border: 1px solid var(--border);
          border-radius: var(--radius);
          animation: rise 0.35s ease both;
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .media {
          width: 96px;
          height: 96px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg);
        }
        .media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .placeholder {
          width: 100%;
          height: 100%;
          background:
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 6px,
              rgba(255,255,255,0.04) 6px,
              rgba(255,255,255,0.04) 12px
            );
        }
        .body {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.35rem;
        }
        .top {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: baseline;
        }
        .body h2 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
        }
        .price {
          flex-shrink: 0;
          color: var(--accent);
          font-weight: 700;
          font-size: 0.95rem;
        }
        .body p {
          margin: 0;
          color: var(--muted);
          font-size: 0.85rem;
          line-height: 1.35;
        }
        .add {
          align-self: start;
          margin-top: 0.25rem;
          border: 1px solid var(--accent);
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          cursor: pointer;
        }
        @media (max-width: 420px) {
          .menu-card {
            grid-template-columns: 76px 1fr;
          }
          .media {
            width: 76px;
            height: 76px;
          }
        }
      `}</style>
    </article>
  )
}
