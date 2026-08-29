import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function CartBar({ tableToken }) {
  const { itemCount, estimateTotal } = useCart()
  if (itemCount === 0) return null

  const cartPath = tableToken ? `/mesa/${tableToken}/carrinho` : '/carrinho'

  return (
    <div className="cart-bar">
      <Link to={cartPath} className="cart-cta">
        <span>
          Ver pedido · {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
        <strong>{formatPrice(estimateTotal)}</strong>
      </Link>

      <style>{`
        .cart-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 0.85rem 1rem 1.1rem;
          background: linear-gradient(transparent, rgba(26,21,16,0.92) 30%);
          z-index: 30;
        }
        .cart-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 720px;
          margin: 0 auto;
          background: var(--accent);
          color: #1a1510;
          text-decoration: none;
          font-weight: 600;
          padding: 0.9rem 1.1rem;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
      `}</style>
    </div>
  )
}
