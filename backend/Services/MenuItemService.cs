using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;

namespace Backend.Services
{
    public class MenuItemService : IMenuItemService
    {
        private readonly IMenuItemRepository _repository;
        private readonly ApplicationDbContext _db;

        public MenuItemService(IMenuItemRepository repository, ApplicationDbContext db)
        {
            _repository = repository;
            _db = db;
        }

        public async Task<List<MenuItemDto>> GetAllAsync(bool onlyAvailable = false)
        {
            var items = await _repository.GetAllAsync(onlyAvailable);
            return items.Select(ToDto).ToList();
        }

        public async Task<MenuItemDto?> GetByIdAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item is null ? null : ToDto(item);
        }

        public async Task<MenuItemDto> CreateAsync(CreateMenuItemDto dto)
        {
            Validate(dto.Name, dto.Price);

            if (dto.CategoryId.HasValue && !await _repository.CategoryExistsAsync(dto.CategoryId.Value))
                throw new ArgumentException("Categoria informada não existe.");

            var item = new MenuItem
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Available = dto.Available
            };

            await _repository.AddAsync(item);
            var created = await _repository.GetByIdAsync(item.Id);
            return ToDto(created!);
        }

        public async Task<MenuItemDto?> UpdateAsync(int id, UpdateMenuItemDto dto)
        {
            var tracked = await _db.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
            if (tracked is null) return null;

            Validate(dto.Name, dto.Price);

            if (dto.CategoryId.HasValue && !await _repository.CategoryExistsAsync(dto.CategoryId.Value))
                throw new ArgumentException("Categoria informada não existe.");

            tracked.Name = dto.Name.Trim();
            tracked.Description = dto.Description?.Trim();
            tracked.Price = dto.Price;
            tracked.CategoryId = dto.CategoryId;
            tracked.Available = dto.Available;

            await _db.SaveChangesAsync();
            var updated = await _repository.GetByIdAsync(id);
            return ToDto(updated!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item is null) return false;

            await _repository.DeleteAsync(item);
            return true;
        }

        public async Task<(byte[] Data, string ContentType)?> GetPhotoAsync(int id)
        {
            var item = await _repository.GetPhotoAsync(id);
            if (item?.PhotoData is null || item.PhotoData.Length == 0)
                return null;

            return (item.PhotoData, item.PhotoContentType ?? "image/jpeg");
        }

        public async Task<MenuItemDto?> SetPhotoAsync(int id, Stream photoStream, long contentLength)
        {
            if (contentLength <= 0 || contentLength > ImageConverter.MaxUploadBytes)
                throw new ArgumentException("A imagem deve ter entre 1 byte e 5 MB.");

            var tracked = await _db.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
            if (tracked is null) return null;

            try
            {
                var (data, contentType) = ImageConverter.ToStoredJpeg(photoStream);
                tracked.PhotoData = data;
                tracked.PhotoContentType = contentType;
            }
            catch (UnknownImageFormatException)
            {
                throw new ArgumentException("Formato de imagem não suportado.");
            }
            catch (Exception)
            {
                throw new ArgumentException("Não foi possível processar a imagem.");
            }

            await _db.SaveChangesAsync();
            var updated = await _repository.GetByIdAsync(id);
            return ToDto(updated!);
        }

        public async Task<bool> ClearPhotoAsync(int id)
        {
            var tracked = await _db.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
            if (tracked is null) return false;

            tracked.PhotoData = null;
            tracked.PhotoContentType = null;
            await _db.SaveChangesAsync();
            return true;
        }

        private static void Validate(string name, decimal price)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("O nome do produto é obrigatório.");
            if (price < 0)
                throw new ArgumentException("O preço não pode ser negativo.");
        }

        private static MenuItemDto ToDto(MenuItem item)
        {
            var hasPhoto = !string.IsNullOrEmpty(item.PhotoContentType);
            return new MenuItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Price = item.Price,
                HasPhoto = hasPhoto,
                PhotoUrl = hasPhoto ? $"/api/menuitems/{item.Id}/photo" : null,
                CategoryId = item.CategoryId,
                CategoryName = item.Category?.Name,
                Available = item.Available
            };
        }
    }
}
