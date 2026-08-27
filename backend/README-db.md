PostgreSQL setup and migrations

- Update the connection in `appsettings.json` (`ConnectionStrings:DefaultConnection`).
- To use EF Core migrations (recommended):

```bash
cd backend
dotnet tool install --global dotnet-ef # if not installed
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
```

- Alternatively run the provided SQL script against your Postgres server:

```bash
psql "host=localhost port=5432 dbname=postgres user=postgres" -f db/init.sql
```

Adjust credentials/host as needed. After DB is created, run the API:

```bash
dotnet run --project backend
```
