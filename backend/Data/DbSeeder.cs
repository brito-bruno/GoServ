using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    /// <summary>
    /// Popula dados de demo. Cada bloco é independente para bases já existentes.
    /// </summary>
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext db)
        {
            await SeedMenuAsync(db);
            await SeedUsersAsync(db);
            await SeedTablesAsync(db);
            await SeedAddonsAsync(db);
        }

        private static async Task SeedMenuAsync(ApplicationDbContext db)
        {
            if (await db.Categories.AnyAsync())
                return;

            var burgers = new Category { Name = "Burgers", SortOrder = 1 };
            var sides = new Category { Name = "Acompanhamentos", SortOrder = 2 };
            var drinks = new Category { Name = "Bebidas", SortOrder = 3 };

            db.Categories.AddRange(burgers, sides, drinks);
            await db.SaveChangesAsync();

            db.MenuItems.AddRange(
                new MenuItem
                {
                    Name = "Classic Burger",
                    Description = "Pão, blend 160g, queijo, alface e tomate.",
                    Price = 28.90m,
                    CategoryId = burgers.Id,
                    Available = true
                },
                new MenuItem
                {
                    Name = "Bacon Burger",
                    Description = "Classic com bacon crocante e molho da casa.",
                    Price = 34.90m,
                    CategoryId = burgers.Id,
                    Available = true
                },
                new MenuItem
                {
                    Name = "Batata Frita",
                    Description = "Porção individual crocante.",
                    Price = 14.90m,
                    CategoryId = sides.Id,
                    Available = true
                },
                new MenuItem
                {
                    Name = "Onion Rings",
                    Description = "Anéis de cebola empanados.",
                    Price = 16.90m,
                    CategoryId = sides.Id,
                    Available = false
                },
                new MenuItem
                {
                    Name = "Refrigerante Lata",
                    Description = "350ml — sabores variados.",
                    Price = 7.50m,
                    CategoryId = drinks.Id,
                    Available = true
                },
                new MenuItem
                {
                    Name = "Suco Natural",
                    Description = "Laranja ou limão — 400ml.",
                    Price = 12.00m,
                    CategoryId = drinks.Id,
                    Available = true
                }
            );

            await db.SaveChangesAsync();
        }

        private static async Task SeedUsersAsync(ApplicationDbContext db)
        {
            if (await db.Users.AnyAsync())
                return;

            db.Users.AddRange(
                new User
                {
                    Name = "Admin GoServ",
                    Email = "admin@goserv.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRoles.Admin,
                    Active = true
                },
                new User
                {
                    Name = "Cozinha",
                    Email = "cozinha@goserv.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("cozinha123"),
                    Role = UserRoles.Kitchen,
                    Active = true
                }
            );

            await db.SaveChangesAsync();
        }

        private static async Task SeedTablesAsync(ApplicationDbContext db)
        {
            if (await db.DiningTables.AnyAsync())
                return;

            db.DiningTables.AddRange(
                new DiningTable { Label = "Mesa 1", Active = true },
                new DiningTable { Label = "Mesa 2", Active = true },
                new DiningTable { Label = "Mesa 3", Active = true },
                new DiningTable { Label = "Balcão", Active = true }
            );

            await db.SaveChangesAsync();
        }

        private static async Task SeedAddonsAsync(ApplicationDbContext db)
        {
            if (await db.Addons.AnyAsync())
                return;

            var classic = await db.MenuItems.FirstOrDefaultAsync(m => m.Name == "Classic Burger");
            var bacon = await db.MenuItems.FirstOrDefaultAsync(m => m.Name == "Bacon Burger");
            if (classic is null && bacon is null)
                return;

            if (classic is not null)
            {
                db.Addons.AddRange(
                    new Addon { MenuItemId = classic.Id, Name = "Queijo extra", Price = 4.00m, Available = true },
                    new Addon { MenuItemId = classic.Id, Name = "Bacon", Price = 5.50m, Available = true },
                    new Addon { MenuItemId = classic.Id, Name = "Sem cebola", Price = 0m, Available = true }
                );
            }

            if (bacon is not null)
            {
                db.Addons.AddRange(
                    new Addon { MenuItemId = bacon.Id, Name = "Queijo extra", Price = 4.00m, Available = true },
                    new Addon { MenuItemId = bacon.Id, Name = "Egg", Price = 3.50m, Available = true }
                );
            }

            await db.SaveChangesAsync();
        }
    }
}
