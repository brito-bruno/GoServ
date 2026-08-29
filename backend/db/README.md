# Snapshot do banco (versionado)

O arquivo `snapshot.sql` (gerado por `npm run db:export`) contém **schema + dados**,
incluindo fotos JPEG convertidas gravadas em `MenuItems.PhotoData`.

## Fluxo do time

1. Suba o projeto, cadastre produtos/fotos no admin.
2. Exporte e versione:

```powershell
npm run db:export
git add backend/db/snapshot.sql
git commit -m "Atualiza snapshot do banco com cardapio e fotos"
```

3. Outro integrante / PC da faculdade:

```powershell
npm run setup    # sobe Docker e restaura o snapshot se existir
npm run dev
```

Ou só:

```powershell
npm run db:restore
```

Sem snapshot, a API usa migrations + seed automático (sem fotos binárias).
