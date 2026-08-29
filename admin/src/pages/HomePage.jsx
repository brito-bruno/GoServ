export default function HomePage() {
  return (
    <section>
      <h1>Painel do estabelecimento</h1>
      <p>
        Cadastre o cardápio, abra sessões de mesa, acompanhe a cozinha e veja o
        desempenho do dia. O cliente acessa pelo link/QR gerado em Mesas.
      </p>
      <ul>
        <li>
          <strong>Cozinha</strong> — pedidos ao vivo (SignalR), avanço de status
        </li>
        <li>
          <strong>Produtos / Categorias</strong> — gestão do cardápio (perfil Admin)
        </li>
        <li>
          <strong>Relatórios</strong> — vendas, ticket médio e mais vendidos
        </li>
        <li>
          <strong>Mesas</strong> — sessão com token; kiosk no client com{' '}
          <code>?kiosk=1</code>
        </li>
      </ul>

      <style>{`
        h1 {
          margin: 0 0 0.5rem;
          font-size: 1.6rem;
          letter-spacing: -0.02em;
        }
        p, li {
          color: var(--muted);
          line-height: 1.5;
        }
        ul {
          margin: 1.25rem 0 0;
          padding-left: 1.1rem;
        }
        li { margin-bottom: 0.5rem; }
        strong { color: var(--ink); }
        code {
          font-family: var(--mono);
          font-size: 0.85em;
          background: var(--bg);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
      `}</style>
    </section>
  )
}
