import React from 'react'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import TablesPage from './pages/TablesPage'
import KitchenPage from './pages/KitchenPage'
import ReportsPage from './pages/ReportsPage'

function Shell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'Admin'
  const wide = location.pathname.includes('cozinha')

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">GoServ</span>
          <span className="badge">{user?.role === 'Kitchen' ? 'Cozinha' : 'Admin'}</span>
        </div>
        <nav>
          <NavLink to="/" end>
            Início
          </NavLink>
          <NavLink to="/cozinha">Cozinha</NavLink>
          {isAdmin && <NavLink to="/produtos">Produtos</NavLink>}
          {isAdmin && <NavLink to="/categorias">Categorias</NavLink>}
          {isAdmin && <NavLink to="/relatorios">Relatórios</NavLink>}
          <NavLink to="/mesas">Mesas</NavLink>
        </nav>
        <div className="user-box">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button type="button" className="logout" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>

      <main className={wide ? 'content wide' : 'content'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/cozinha"
            element={
              <ProtectedRoute roles={['Admin', 'Kitchen']}>
                <KitchenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute roles={['Admin']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute roles={['Admin']}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute roles={['Admin']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mesas"
            element={
              <ProtectedRoute roles={['Admin', 'Kitchen']}>
                <TablesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <style>{`
        .shell {
          display: grid;
          grid-template-columns: 220px 1fr;
          min-height: 100vh;
        }
        .sidebar {
          padding: 1.5rem 1.1rem;
          border-right: 1px solid var(--line);
          background: var(--panel);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .brand {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        .logo {
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
        }
        .badge {
          font-family: var(--mono);
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--accent);
          background: rgba(31, 107, 74, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        nav a {
          padding: 0.55rem 0.7rem;
          border-radius: 8px;
          color: var(--muted);
          font-weight: 500;
        }
        nav a:hover { background: var(--bg); color: var(--ink); }
        nav a.active {
          background: rgba(31, 107, 74, 0.12);
          color: var(--accent);
        }
        .user-box {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.85rem;
        }
        .user-box span { color: var(--muted); }
        .logout {
          margin-top: 0.5rem;
          align-self: flex-start;
          border: 1px solid var(--line);
          background: transparent;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .content {
          padding: 1.75rem 1.5rem 3rem;
          max-width: 960px;
        }
        .content.wide {
          max-width: 1200px;
        }
        @media (max-width: 760px) {
          .shell { grid-template-columns: 1fr; }
          .sidebar {
            border-right: none;
            border-bottom: 1px solid var(--line);
          }
          nav { flex-direction: row; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
