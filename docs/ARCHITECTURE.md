# Arquitetura

Monorepo com duas partes principais:

- `frontend/` — React (Vite)
- `backend/` — ASP.NET Core Minimal API

Comunicação: front chama endpoints REST do backend em `/api/*` ou configurar proxy durante desenvolvimento.
