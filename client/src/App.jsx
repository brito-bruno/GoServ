import { BrowserRouter, Outlet, Route, Routes, useParams } from 'react-router-dom'
import { CartProvider } from './cart/CartContext'
import { useKioskMode } from './hooks/useKioskMode'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderStatusPage from './pages/OrderStatusPage'

function KioskBootstrap() {
  useKioskMode()
  return null
}

function CartLayout() {
  const { tableToken } = useParams()
  return (
    <CartProvider accessToken={tableToken || null}>
      <Outlet />
    </CartProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <KioskBootstrap />
      <Routes>
        <Route element={<CartLayout />}>
          <Route path="/" element={<MenuPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/pedido/:orderId" element={<OrderStatusPage />} />
        </Route>
        <Route path="/mesa/:tableToken" element={<CartLayout />}>
          <Route index element={<MenuPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="pedido/:orderId" element={<OrderStatusPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
