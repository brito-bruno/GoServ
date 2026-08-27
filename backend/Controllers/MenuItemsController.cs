using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public MenuItemsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var items = _db.MenuItems.ToList();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var item = _db.MenuItems.Find(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        public class CreateMenuItemDto
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public decimal Price { get; set; }
            public int? CategoryId { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMenuItemDto dto)
        {
            var item = new MenuItem
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Available = true
            };

            _db.MenuItems.Add(item);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }
    }
}
