using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => Results.Text("API funcionando"));
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
