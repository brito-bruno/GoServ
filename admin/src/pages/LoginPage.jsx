import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = React.useState('admin@goserv.local')
  const [password, setPassword] = React.useState('admin123')
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const from = location.state?.from?.pathname || '/'

  React.useEffect(() => {
    if (ready && isAuthenticated) navigate(from, { replace: true })
  }, [ready, isAuthenticated, from, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Falha no login')
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null
  if (isAuthenticated) return <Navigate to={from} replace />

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="brand">GoServ</p>
        <h1>Acesso interno</h1>
        <p className="sub">Admin e cozinha — use as credenciais de demo.</p>

        {error && <p className="error">{error}</p>}

        <label>
          E-mail
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="hint">
          Demo: <code>admin@goserv.local</code> / <code>admin123</code>
          <br />
          Cozinha: <code>cozinha@goserv.local</code> / <code>cozinha123</code>
        </p>
      </form>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 1.5rem;
          background:
            radial-gradient(ellipse 70% 50% at 20% 0%, #dfe8df, transparent),
            var(--bg);
        }
        .login-card {
          width: min(100%, 400px);
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 1.6rem 1.4rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .brand {
          margin: 0;
          font-weight: 700;
          font-size: 1.5rem;
          letter-spacing: -0.03em;
          color: var(--accent);
        }
        h1 {
          margin: 0;
          font-size: 1.2rem;
        }
        .sub, .hint {
          margin: 0;
          color: var(--muted);
          font-size: 0.88rem;
          line-height: 1.45;
        }
        .hint code {
          font-family: var(--mono);
          font-size: 0.78rem;
        }
        .error { margin: 0; color: var(--danger); font-size: 0.9rem; }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        input {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 0.6rem 0.7rem;
          background: #fff;
        }
        button {
          margin-top: 0.35rem;
          border: none;
          background: var(--accent);
          color: #fff;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover { background: var(--accent-hover); }
        button:disabled { opacity: 0.65; cursor: wait; }
      `}</style>
    </div>
  )
}
