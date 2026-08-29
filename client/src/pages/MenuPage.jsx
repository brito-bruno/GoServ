import React from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchCategories,
  fetchMenuItems,
  validateTableSession,
} from '../services/api'
import { useCart } from '../cart/CartContext'
import { useKioskMode } from '../hooks/useKioskMode'
import { useKioskIdleReset } from '../hooks/useKioskIdleReset'
import MenuItemCard from '../components/MenuItemCard'
import CategoryTabs from '../components/CategoryTabs'
import CustomizeModal from '../components/CustomizeModal'
import CartBar from '../components/CartBar'

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function MenuPage() {
  const { tableToken } = useParams()
  const kiosk = useKioskMode()
  const { addLine } = useCart()
  const homePath = tableToken ? `/mesa/${tableToken}` : '/'
  useKioskIdleReset(homePath)
  const [session, setSession] = React.useState(null)
  const [categories, setCategories] = React.useState([])
  const [items, setItems] = React.useState([])
  const [activeCategoryId, setActiveCategoryId] = React.useState(null)
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        if (tableToken) {
          const tableSession = await validateTableSession(tableToken)
          if (cancelled) return
          setSession(tableSession)
        }

        const [cats, menu] = await Promise.all([
          fetchCategories(),
          fetchMenuItems(),
        ])
        if (cancelled) return
        setCategories(cats)
        setItems(menu)
        setActiveCategoryId(cats[0]?.id ?? null)
      } catch (e) {
        if (!cancelled) {
          setError(
            tableToken
              ? e.message || 'Sessão da mesa inválida ou expirada.'
              : e.message || 'Falha ao carregar o cardápio'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tableToken])

  const visibleItems =
    activeCategoryId == null
      ? items
      : items.filter((item) => item.categoryId === activeCategoryId)

  return (
    <div className="menu-page">
      <header className="menu-header">
        <p className="brand">
          GoServ
          {kiosk && <span className="kiosk-badge">Kiosk</span>}
        </p>
        <h1>Cardápio</h1>
        <p className="subtitle">
          {session
            ? `${session.tableLabel} · sessão ativa`
            : kiosk
              ? 'Toque para montar seu pedido.'
              : 'Escolha e peça direto da mesa.'}
        </p>
      </header>

      {loading && <p className="state">Carregando cardápio…</p>}
      {error && <p className="state error">{error}</p>}

      {!loading && !error && (
        <>
          <CategoryTabs
            categories={categories}
            activeId={activeCategoryId}
            onChange={setActiveCategoryId}
          />

          <section className="menu-grid" aria-live="polite">
            {visibleItems.length === 0 ? (
              <p className="state">Nenhum item nesta categoria.</p>
            ) : (
              visibleItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  priceLabel={formatPrice(item.price)}
                  onAdd={setSelectedItem}
                />
              ))
            )}
          </section>
        </>
      )}

      {selectedItem && (
        <CustomizeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={(payload) => {
            addLine(payload)
            setSelectedItem(null)
          }}
        />
      )}

      <CartBar tableToken={tableToken} />

      <style>{`
        .menu-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 1.25rem 5.5rem;
        }
        .menu-header {
          margin-bottom: 1.75rem;
        }
        .brand {
          margin: 0 0 0.35rem;
          font-family: var(--display);
          font-size: clamp(2rem, 8vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--accent);
        }
        .menu-header h1 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--text);
        }
        .subtitle {
          margin: 0.4rem 0 0;
          color: var(--muted);
          font-size: 0.95rem;
        }
        .menu-grid {
          display: grid;
          gap: 1rem;
        }
        .state {
          color: var(--muted);
        }
        .state.error {
          color: var(--danger);
        }
      `}</style>
    </div>
  )
}
