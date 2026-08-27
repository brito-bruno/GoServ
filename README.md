# Monorepo — Site (React + ASP.NET Core)

Estrutura inicial para monorepo com front-end em React e back-end em C# (ASP.NET Core).

Estrutura proposta:

- `frontend/` — app React (Vite)
- `backend/` — API .NET minimal
- `docs/` — documentação do projeto
- `scripts/` — scripts auxiliares (setup, deploy)

Comandos rápidos:

- Frontend (na pasta `frontend`):

```bash
npm install
npm run dev
```

- Backend (na pasta `backend`):

```bash
dotnet restore
dotnet run
```

Próximos passos:
- Mover o conteúdo atual de `app/web` para `frontend/src` (ou integrar conforme necessário).
- Ajustar `package.json` e `csproj` conforme dependências reais.
