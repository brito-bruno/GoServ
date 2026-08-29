import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchOrder } from '../services/api'
import { connectOrderHub } from '../services/orderHub'

const STATUS_LABEL = {
  Received: 'Recebido',
  Preparing: 'Em preparo',
  Ready: 'Pronto!',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
}

const STEPS = ['Received', 'Preparing', 'Ready', 'Delivered']

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function OrderStatusPage() {
  const { orderId: publicId, tableToken } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = React.useState(null)
  const [error, setError] = React.useState('')
  const [live, setLive] = React.useState('connecting')
  const readyAlertSent = React.useRef(false)

  const menuPath = tableToken ? `/mesa/${tableToken}` : '/'

  React.useEffect(() => {
    let cancelled = false
    let connection

    async function boot() {
      try {
        const initial = await fetchOrder(publicId)
        if (cancelled) return
        setOrder(initial)

        connection = connectOrderHub({
          publicId,
          onUpdated: (updated) => {
            if (cancelled) return
            setOrder(updated)
          },
          onStatus: (status) => {
            if (!cancelled) setLive(status)
          },
        })
        await connection.start()
        await connection.invoke('WatchOrder', publicId)
        if (!cancelled) setLive('online')
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Não foi possível acompanhar o pedido')
          setLive('offline')
        }
      }
    }

    boot()
    return () => {
      cancelled = true
      connection?.stop()
    }
  }, [publicId])

  React.useEffect(() => {
    if (order?.status !== 'Ready' || readyAlertSent.current) return
    readyAlertSent.current = true

    if (typeof window === 'undefined' || !('Notification' in window)) return

    const body = order.tableLabel
      ? `${order.tableLabel} · pedido #${order.id}`
      : `Pedido #${order.id} está pronto para retirada.`

    if (Notification.permission === 'granted') {
      new Notification('GoServ — Pedido pronto!', { body })
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('GoServ — Pedido pronto!', { body })
        }
      })
    }
  }, [order])

  if (error) {
    return (
      <div className="page">
        <p className="err">{error}</p>
        <button type="button" className="primary" onClick={() => navigate(menuPath)}>
          Voltar ao cardápio
        </button>
        <Styles />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="page">
        <p className="muted">Carregando pedido…</p>
        <Styles />
      </div>
    )
  }

  const isReady = order.status === 'Ready'
  const isDone = order.status === 'Delivered' || order.status === 'Cancelled'
  const stepIndex = STEPS.indexOf(order.status)

  return (
    <div className={`page ${isReady ? 'ready-mode' : ''}`}>
      <Link to={menuPath} className="back">
        ← Cardápio
      </Link>

      {isReady && (
        <div className="banner" role="status" aria-live="assertive">
          <p className="banner-title">Seu pedido está pronto!</p>
          <p className="banner-sub">
            {order.tableLabel
              ? `Retire na ${order.tableLabel}`
              : `Pedido #${order.id}`}
          </p>
        </div>
      )}

      <header className="head">
        <p className="brand">GoServ</p>
        <h1>Pedido #{order.id}</h1>
        <p className="sub">
          {order.tableLabel ? `${order.tableLabel} · ` : ''}
          {formatPrice(order.total)}
          <span className={`dot ${live}`}>
            {live === 'online' ? 'ao vivo' : live}
          </span>
        </p>
      </header>

      <ol className="steps">
        {STEPS.map((status, index) => {
          const active = index <= stepIndex && order.status !== 'Cancelled'
          const current = status === order.status
          return (
            <li
              key={status}
              className={`${active ? 'active' : ''} ${current ? 'current' : ''}`}
            >
              {STATUS_LABEL[status]}
            </li>
          )
        })}
      </ol>

      {order.status === 'Cancelled' && (
        <p className="err">Este pedido foi cancelado pela cozinha.</p>
      )}

      <ul className="items">
        {order.items.map((item) => (
          <li key={item.id}>
            <strong>
              {item.quantity}× {item.menuItemName}
            </strong>
            {item.addons?.length > 0 && (
              <span>{item.addons.map((a) => a.name).join(', ')}</span>
            )}
            {item.notes && <span>Obs.: {item.notes}</span>}
          </li>
        ))}
      </ul>

      {!isDone && (
        <p className="hint">
          Esta tela atualiza sozinha. Quando estiver pronto, avisamos aqui
          {order.tableLabel ? ` (${order.tableLabel})` : ''}.
        </p>
      )}

      {isDone && (
        <button type="button" className="primary" onClick={() => navigate(menuPath)}>
          Fazer novo pedido
        </button>
      )}

      <Styles />
    </div>
  )
}

function Styles() {
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
      .brand {
        margin: 0.9rem 0 0.2rem;
        font-family: var(--display);
        font-size: 1.6rem;
        color: var(--accent);
        font-weight: 700;
      }
      .head h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      .sub {
        margin: 0.35rem 0 0;
        color: var(--muted);
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      .dot {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        border: 1px solid var(--border);
      }
      .dot.online {
        color: var(--accent);
        border-color: var(--accent);
      }
      .banner {
        margin: 1rem 0 0.5rem;
        padding: 1.1rem 1rem;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent), #f0c57a);
        color: #1a1510;
        animation: pulse 1.2s ease infinite alternate;
      }
      @keyframes pulse {
        from { transform: scale(1); }
        to { transform: scale(1.015); }
      }
      .banner-title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
      }
      .banner-sub {
        margin: 0.25rem 0 0;
        font-weight: 600;
      }
      .steps {
        list-style: none;
        margin: 1.25rem 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.4rem;
      }
      .steps li {
        text-align: center;
        font-size: 0.72rem;
        padding: 0.45rem 0.2rem;
        border-radius: 8px;
        background: var(--bg-elevated);
        color: var(--muted);
        border: 1px solid var(--border);
      }
      .steps li.active {
        color: var(--text);
        border-color: rgba(232, 165, 75, 0.35);
      }
      .steps li.current {
        background: var(--accent-soft);
        color: var(--accent);
        font-weight: 700;
      }
      .items {
        list-style: none;
        margin: 0 0 1rem;
        padding: 0;
        display: grid;
        gap: 0.65rem;
      }
      .items li {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.75rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
      }
      .items span {
        color: var(--muted);
        font-size: 0.85rem;
      }
      .hint, .muted { color: var(--muted); font-size: 0.9rem; }
      .err { color: var(--danger); }
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
      @media (max-width: 480px) {
        .steps { grid-template-columns: 1fr 1fr; }
      }
    `}</style>
  )
}
