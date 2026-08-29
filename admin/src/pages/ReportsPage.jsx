import React from 'react'
import { api } from '../services/api'

const STATUS_LABEL = {
  Received: 'Recebido',
  Preparing: 'Em preparo',
  Ready: 'Pronto',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function todayInputValue() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function ReportsPage() {
  const [date, setDate] = React.useState(todayInputValue)
  const [report, setReport] = React.useState(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async (day) => {
    setLoading(true)
    setError('')
    try {
      setReport(await api.getDailyReport(day))
    } catch (e) {
      setError(e.message)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load(date)
  }, [date, load])

  return (
    <section className="page">
      <header className="head">
        <div>
          <h1>Relatórios</h1>
          <p>Vendas do dia, ticket médio e itens mais pedidos.</p>
        </div>
        <label>
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </header>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Carregando…</p>}

      {!loading && report && (
        <>
          <div className="metrics">
            <article>
              <span>Pedidos</span>
              <strong>{report.ordersCount}</strong>
            </article>
            <article>
              <span>Vendas</span>
              <strong>{formatPrice(report.totalSales)}</strong>
            </article>
            <article>
              <span>Ticket médio</span>
              <strong>{formatPrice(report.averageTicket)}</strong>
            </article>
          </div>

          <div className="grid">
            <div className="panel">
              <h2>Mais vendidos</h2>
              {report.topItems.length === 0 ? (
                <p className="muted">Sem vendas neste dia.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qtd</th>
                      <th>Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topItems.map((item) => (
                      <tr key={item.menuItemId}>
                        <td>{item.name}</td>
                        <td>{item.quantitySold}</td>
                        <td>{formatPrice(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="panel">
              <h2>Por status</h2>
              {report.byStatus.length === 0 ? (
                <p className="muted">Nenhum pedido neste dia.</p>
              ) : (
                <ul className="status-list">
                  {report.byStatus.map((row) => (
                    <li key={row.status}>
                      <span>{STATUS_LABEL[row.status] || row.status}</span>
                      <strong>{row.count}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        .head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: end;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
        .head p { margin: 0; color: var(--muted); }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        input[type="date"] {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          background: #fff;
        }
        .error { color: var(--danger); }
        .muted { color: var(--muted); }
        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .metrics article {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .metrics span { color: var(--muted); font-size: 0.85rem; }
        .metrics strong { font-size: 1.35rem; letter-spacing: -0.02em; }
        .grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 0.85rem;
        }
        .panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 1rem 1.1rem;
        }
        .panel h2 { margin: 0 0 0.85rem; font-size: 1rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
          text-align: left;
          padding: 0.5rem 0.25rem;
          border-bottom: 1px solid var(--line);
          font-size: 0.9rem;
        }
        th { color: var(--muted); font-weight: 500; }
        .status-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.5rem;
        }
        .status-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.45rem 0;
          border-bottom: 1px solid var(--line);
          font-size: 0.92rem;
        }
        @media (max-width: 800px) {
          .metrics, .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}
