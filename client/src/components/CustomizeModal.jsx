import React from 'react'
import { fetchAddons } from '../services/api'

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function CustomizeModal({ item, onClose, onConfirm }) {
  const [addons, setAddons] = React.useState([])
  const [selected, setSelected] = React.useState({})
  const [quantity, setQuantity] = React.useState(1)
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const list = await fetchAddons(item.id)
        if (!cancelled) setAddons(list)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [item.id])

  const selectedAddons = addons.filter((a) => selected[a.id])
  const estimate =
    (Number(item.price) +
      selectedAddons.reduce((sum, a) => sum + Number(a.price), 0)) *
    quantity

  function toggleAddon(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleConfirm() {
    onConfirm({
      menuItem: item,
      quantity,
      notes: notes.trim(),
      addons: selectedAddons,
    })
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="sheet">
        <header>
          <h2>{item.name}</h2>
          <button type="button" className="icon" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        {loading && <p className="muted">Carregando opções…</p>}
        {error && <p className="err">{error}</p>}

        {!loading && addons.length > 0 && (
          <fieldset>
            <legend>Adicionais</legend>
            {addons.map((addon) => (
              <label key={addon.id} className="check">
                <input
                  type="checkbox"
                  checked={Boolean(selected[addon.id])}
                  onChange={() => toggleAddon(addon.id)}
                />
                <span>{addon.name}</span>
                <span className="price">
                  {Number(addon.price) === 0 ? 'grátis' : `+ ${formatPrice(addon.price)}`}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <label className="block">
          Observação
          <textarea
            rows={2}
            placeholder='Ex.: sem cebola, ponto da carne…'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="qty">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)}>
            +
          </button>
        </div>

        <button type="button" className="primary" onClick={handleConfirm}>
          Adicionar · {formatPrice(estimate)}
        </button>
      </div>

      <style>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: grid;
          align-items: end;
          z-index: 40;
          animation: fade 0.2s ease;
        }
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        .sheet {
          background: var(--bg-elevated);
          border-radius: 18px 18px 0 0;
          padding: 1.1rem 1.2rem 1.4rem;
          max-height: 85vh;
          overflow: auto;
          animation: up 0.25s ease;
        }
        @keyframes up {
          from { transform: translateY(24px) }
          to { transform: translateY(0) }
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
          margin-bottom: 0.85rem;
        }
        header h2 { margin: 0; font-size: 1.2rem; }
        .icon {
          border: none;
          background: transparent;
          color: var(--muted);
          font-size: 1.6rem;
          line-height: 1;
          cursor: pointer;
        }
        fieldset {
          border: 1px solid var(--border);
          border-radius: 12px;
          margin: 0 0 0.9rem;
          padding: 0.65rem 0.75rem;
        }
        legend { padding: 0 0.35rem; color: var(--muted); font-size: 0.8rem; }
        .check {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.55rem;
          align-items: center;
          padding: 0.4rem 0;
          font-size: 0.95rem;
        }
        .check .price { color: var(--accent); font-size: 0.85rem; }
        .block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.85rem;
          margin-bottom: 0.9rem;
        }
        textarea {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg);
          color: var(--text);
          padding: 0.6rem 0.7rem;
          resize: vertical;
        }
        .qty {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.9rem;
          background: var(--bg);
          border-radius: 999px;
          padding: 0.25rem;
        }
        .qty button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: var(--surface);
          color: var(--text);
          font-size: 1.1rem;
          cursor: pointer;
        }
        .qty span { min-width: 1.5rem; text-align: center; font-weight: 600; }
        .primary {
          width: 100%;
          border: none;
          background: var(--accent);
          color: #1a1510;
          font-weight: 700;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          cursor: pointer;
        }
        .muted { color: var(--muted); }
        .err { color: var(--danger); }
        @media (min-width: 640px) {
          .overlay { align-items: center; justify-items: center; }
          .sheet {
            width: min(420px, 92vw);
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  )
}
