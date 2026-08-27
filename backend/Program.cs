using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

// Configure DbContext with PostgreSQL (connection string in appsettings.json)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
	builder.Services.AddDbContext<ApplicationDbContext>(options =>
		options.UseNpgsql(connectionString)
	);
}

var app = builder.Build();

// Apply pending migrations at startup (if any) with retry (database may take time to become ready)
using (var scope = app.Services.CreateScope())
{
	var logger = scope.ServiceProvider.GetService<ILoggerFactory>()?.CreateLogger("Program");
	var maxAttempts = 10;
	var delayMs = 2000;
	for (int attempt = 1; attempt <= maxAttempts; attempt++)
	{
		try
		{
			var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
			db.Database.Migrate();
			logger?.LogInformation("Database migrated successfully.");
			break;
		}
		catch (Exception ex)
		{
			logger?.LogWarning(ex, "Attempt {Attempt} to migrate database failed.", attempt);
			if (attempt == maxAttempts)
			{
				logger?.LogError(ex, "Exceeded max attempts applying migrations.\n{Message}", ex.Message);
				throw;
			}
			Thread.Sleep(delayMs);
		}
	}
}

app.MapControllers();

app.Run();
