import React from 'react'
import { api } from '../services/api'
import { connectKitchenHub } from '../services/kitchenHub'

const COLUMNS = [
  { status: 'Received', title: 'Recebidos', next: 'Preparing', nextLabel: 'Preparar' },
  { status: 'Preparing', title: 'Em preparo', next: 'Ready', nextLabel: 'Pronto' },
  { status: 'Ready', title: 'Prontos', next: 'Delivered', nextLabel: 'Entregar' },
]

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function KitchenPage() {
  const [orders, setOrders] = React.useState([])
  const [error, setError] = React.useState('')
  const [live, setLive] = React.useState('connecting')
  const [busyId, setBusyId] = React.useState(null)

  const upsertOrder = React.useCallback((order) => {
    setOrders((prev) => {
      const without = prev.filter((o) => o.id !== order.id)
      if (order.status === 'Delivered' || order.status === 'Cancelled') {
        return without
      }
      return [order, ...without].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    })
  }, [])

  React.useEffect(() => {
    let cancelled = false
    let connection

    async function boot() {
      try {
        setError('')
        const list = await api.getOrders()
        if (cancelled) return
        setOrders(
          list.filter(
            (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
          )
        )

        connection = connectKitchenHub({
          onCreated: (order) => upsertOrder(order),
          onUpdated: (order) => upsertOrder(order),
          onStatus: (status) => {
            if (!cancelled) setLive(status)
          },
        })
        await connection.start()
        if (!cancelled) setLive('online')
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Falha ao carregar a cozinha')
          setLive('offline')
        }
      }
    }

    boot()
    return () => {
      cancelled = true
      connection?.stop()
    }
  }, [upsertOrder])

  async function advance(order, nextStatus) {
    setBusyId(order.id)
    setError('')
    try {
      const updated = await api.updateOrderStatus(order.id, nextStatus)
      upsertOrder(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  async function cancel(order) {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return
    setBusyId(order.id)
    try {
      const updated = await api.updateOrderStatus(order.id, 'Cancelled')
      upsertOrder(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="kitchen">
      <header className="head">
        <div>
          <h1>Cozinha</h1>
          <p>Pedidos em tempo real via SignalR — sem atualizar a página.</p>
        </div>
        <span className={`pulse ${live}`}>
          {live === 'online' ? 'Ao vivo' : live === 'connecting' ? 'Conectando…' : 'Offline'}
        </span>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="board">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.status)
          return (
            <div key={col.status} className="column">
              <h2>
                {col.title}
                <span>{columnOrders.length}</span>
              </h2>
              <div className="stack">
                {columnOrders.length === 0 && (
                  <p className="empty">Nenhum pedido</p>
                )}
                {columnOrders.map((order) => (
                  <article key={order.id} className="ticket">
                    <div className="ticket-head">
                      <strong>#{order.id}</strong>
                      <span>{formatTime(order.createdAt)}</span>
                    </div>
                    <p className="table">
                      {order.tableLabel || 'Sem mesa'} · {formatPrice(order.total)}
                    </p>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <strong>
                            {item.quantity}× {item.menuItemName}
                          </strong>
                          {item.addons?.length > 0 && (
                            <span className="meta">
                              {item.addons.map((a) => a.name).join(', ')}
                            </span>
                          )}
                          {item.notes && (
                            <span className="meta">Obs.: {item.notes}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {order.customerNotes && (
                      <p className="note">Pedido: {order.customerNotes}</p>
                    )}
                    <div className="actions">
                      {col.status === 'Received' && (
                        <button
                          type="button"
                          className="ghost"
                          disabled={busyId === order.id}
                          onClick={() => cancel(order)}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => advance(order, col.next)}
                      >
                        {col.nextLabel}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .kitchen { max-width: none; }
        .head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .head h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
        .head p { margin: 0; color: var(--muted); }
        .pulse {
          font-family: var(--mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          border: 1px solid var(--line);
        }
        .pulse.online {
          color: var(--accent);
          background: rgba(31, 107, 74, 0.12);
          border-color: transparent;
        }
        .pulse.connecting, .pulse.offline { color: var(--muted); }
        .error { color: var(--danger); }
        .board {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 0.85rem;
          align-items: start;
        }
        .column {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 0.75rem;
          min-height: 280px;
        }
        .column h2 {
          margin: 0 0 0.75rem;
          font-size: 0.95rem;
          display: flex;
          justify-content: space-between;
          color: var(--muted);
          font-weight: 600;
        }
        .column h2 span {
          font-family: var(--mono);
          color: var(--ink);
        }
        .stack { display: grid; gap: 0.65rem; }
        .empty {
          margin: 0;
          color: var(--muted);
          font-size: 0.85rem;
          padding: 0.5rem 0;
        }
        .ticket {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 0.75rem;
          animation: pop 0.25s ease;
        }
        @keyframes pop {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ticket-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .table {
          margin: 0 0 0.55rem;
          color: var(--muted);
          font-size: 0.85rem;
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.45rem;
        }
        li {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.92rem;
        }
        .meta {
          color: var(--muted);
          font-size: 0.8rem;
        }
        .note {
          margin: 0.55rem 0 0;
          font-size: 0.82rem;
          color: var(--warn);
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.4rem;
          margin-top: 0.75rem;
        }
        .actions button {
          border: none;
          background: var(--accent);
          color: #fff;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .actions button:disabled { opacity: 0.6; }
        .actions .ghost {
          background: transparent;
          color: var(--danger);
          border: 1px solid var(--line);
        }
        @media (max-width: 900px) {
          .board { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
