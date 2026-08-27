-- Init script for PostgreSQL (basic schema for menu site)

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Example seed data
INSERT INTO categories (name) VALUES ('Entradas') ON CONFLICT DO NOTHING;
INSERT INTO categories (name) VALUES ('Pratos Principais') ON CONFLICT DO NOTHING;
