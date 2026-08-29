import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { useKioskIdleReset } from '../hooks/useKioskIdleReset'
import { createOrder } from '../services/api'

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function CartPage() {
  const { tableToken } = useParams()
  const navigate = useNavigate()
  const {
    lines,
    estimateTotal,
    lineEstimate,
    updateQuantity,
    removeLine,
    customerNotes,
    setCustomerNotes,
    toCreatePayload,
    clear,
    itemCount,
  } = useCart()

  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  const backPath = tableToken ? `/mesa/${tableToken}` : '/'
  useKioskIdleReset(backPath)

  async function handleCheckout() {
    setBusy(true)
    setError('')
    try {
      const order = await createOrder(toCreatePayload())
      clear()
      const trackPath = tableToken
        ? `/mesa/${tableToken}/pedido/${order.publicId}`
        : `/pedido/${order.publicId}`
      navigate(trackPath)
    } catch (e) {
      setError(e.message || 'Falha ao enviar pedido')
    } finally {
      setBusy(false)
    }
  }

  if (itemCount === 0) {
    return (
      <div className="page">
        <Link to={backPath} className="back">
          ← Cardápio
        </Link>
        <h1>Carrinho vazio</h1>
        <p className="muted">Adicione itens do cardápio para continuar.</p>
        <PageStyles />
      </div>
    )
  }

  return (
    <div className="page">
      <Link to={backPath} className="back">
        ← Cardápio
      </Link>
      <h1>Seu pedido</h1>

      <ul className="lines">
        {lines.map((line) => (
          <li key={line.key}>
            <div className="top">
              <strong>
                {line.quantity}× {line.name}
              </strong>
              <span>{formatPrice(lineEstimate(line))}</span>
            </div>
            {line.addons?.length > 0 && (
              <p className="meta">
                {line.addons.map((a) => a.name).join(', ')}
              </p>
            )}
            {line.notes && <p className="meta">Obs.: {line.notes}</p>}
            <div className="actions">
              <button type="button" onClick={() => updateQuantity(line.key, line.quantity - 1)}>
                −
              </button>
              <span>{line.quantity}</span>
              <button type="button" onClick={() => updateQuantity(line.key, line.quantity + 1)}>
                +
              </button>
              <button type="button" className="remove" onClick={() => removeLine(line.key)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <label className="notes">
        Observação geral
        <textarea
          rows={2}
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="Algo para a cozinha sobre o pedido inteiro…"
        />
      </label>

      <div className="total">
        <span>Estimativa</span>
        <strong>{formatPrice(estimateTotal)}</strong>
      </div>
      <p className="hint">O total oficial é recalculado no servidor ao confirmar.</p>

      {error && <p className="err">{error}</p>}

      <button type="button" className="primary" disabled={busy} onClick={handleCheckout}>
        {busy ? 'Enviando…' : 'Confirmar pedido'}
      </button>

      <PageStyles />
    </div>
  )
}

function PageStyles() {
  return (
    <style>{`
      .page {
        max-width: 720px;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 3rem;
      }
      .back {
        color: var(--muted);
        text-decoration: none;
        font-size: 0.9rem;
      }
      h1 {
        margin: 0.75rem 0 1rem;
        font-family: var(--display);
        font-size: 1.8rem;
      }
      .lines {
        list-style: none;
        margin: 0 0 1rem;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }
      .lines li {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 0.85rem;
      }
      .top {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .meta {
        margin: 0.35rem 0 0;
        color: var(--muted);
        font-size: 0.85rem;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.65rem;
      }
      .actions button {
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--text);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
      }
      .actions .remove {
        width: auto;
        margin-left: auto;
        padding: 0 0.65rem;
        color: var(--danger);
      }
      .notes {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }
      textarea {
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--bg-elevated);
        color: var(--text);
        padding: 0.6rem 0.7rem;
      }
      .total {
        display: flex;
        justify-content: space-between;
        font-size: 1.1rem;
        margin-bottom: 0.35rem;
      }
      .hint, .muted { color: var(--muted); font-size: 0.85rem; }
      .err { color: var(--danger); }
      .ok { color: var(--accent); font-weight: 600; }
      .primary {
        width: 100%;
        margin-top: 0.75rem;
        border: none;
        background: var(--accent);
        color: #1a1510;
        font-weight: 700;
        padding: 0.9rem 1rem;
        border-radius: 12px;
        cursor: pointer;
      }
      .primary:disabled { opacity: 0.65; }
    `}</style>
  )
}
