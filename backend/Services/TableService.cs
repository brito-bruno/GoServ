using System.Security.Cryptography;
using Backend.Dtos;
using Backend.Models;
using Backend.Options;
using Backend.Repositories;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public interface ITableService
    {
        Task<List<DiningTableDto>> GetTablesAsync();
        Task<DiningTableDto> CreateTableAsync(CreateDiningTableDto dto);
        Task<TableSessionDto> OpenSessionAsync(int tableId, OpenTableSessionDto dto);
        Task<bool> CloseSessionAsync(int tableId);
        Task<TableSessionDto?> ValidateTokenAsync(string accessToken);
        Task<TableSessionDto?> RaiseSessionCapAsync(int tableId, decimal spendingCap);
    }

    public class TableService : ITableService
    {
        private readonly IDiningTableRepository _repository;
        private readonly IOrderRepository _orders;
        private readonly SecurityOptions _security;

        public TableService(
            IDiningTableRepository repository,
            IOrderRepository orders,
            IOptions<SecurityOptions> security)
        {
            _repository = repository;
            _orders = orders;
            _security = security.Value;
        }

        public async Task<List<DiningTableDto>> GetTablesAsync()
        {
            var tables = await _repository.GetAllAsync();
            var result = new List<DiningTableDto>();

            foreach (var table in tables)
            {
                var session = await _repository.GetOpenSessionByTableIdAsync(table.Id);
                result.Add(await ToTableDtoAsync(table, session));
            }

            return result;
        }

        public async Task<DiningTableDto> CreateTableAsync(CreateDiningTableDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Label))
                throw new ArgumentException("O identificador da mesa é obrigatório.");

            var table = new DiningTable
            {
                Label = dto.Label.Trim(),
                Active = true
            };

            await _repository.AddAsync(table);
            return await ToTableDtoAsync(table, null);
        }

        public async Task<TableSessionDto> OpenSessionAsync(int tableId, OpenTableSessionDto dto)
        {
            var table = await _repository.GetByIdAsync(tableId);
            if (table is null || !table.Active)
                throw new ArgumentException("Mesa não encontrada ou inativa.");

            var minutes = dto.DurationMinutes <= 0 ? 120 : Math.Min(dto.DurationMinutes, 24 * 60);
            await _repository.CloseOpenSessionsAsync(tableId);

            var now = DateTime.UtcNow;
            var session = new TableSession
            {
                DiningTableId = tableId,
                DiningTable = table,
                AccessToken = GenerateToken(),
                OpenedAt = now,
                ExpiresAt = now.AddMinutes(minutes),
                SpendingCap = _security.MaxSpendPerSession
            };

            await _repository.AddSessionAsync(session);
            return await ToSessionDtoAsync(session);
        }

        public async Task<bool> CloseSessionAsync(int tableId)
        {
            var table = await _repository.GetByIdAsync(tableId);
            if (table is null) return false;

            await _repository.CloseOpenSessionsAsync(tableId);
            return true;
        }

        public async Task<TableSessionDto?> ValidateTokenAsync(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                return null;

            var session = await _repository.GetSessionByTokenAsync(accessToken.Trim());
            return session is null ? null : await ToSessionDtoAsync(session);
        }

        public async Task<TableSessionDto?> RaiseSessionCapAsync(int tableId, decimal spendingCap)
        {
            if (spendingCap < 0)
                throw new ArgumentException("O teto de gastos não pode ser negativo.");

            var session = await _repository.GetOpenSessionByTableIdAsync(tableId);
            if (session is null)
                throw new ArgumentException("Não há sessão aberta nesta mesa.");

            session.SpendingCap = spendingCap;
            await _repository.UpdateSessionAsync(session);
            return await ToSessionDtoAsync(session);
        }

        private static string GenerateToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(24);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private async Task<DiningTableDto> ToTableDtoAsync(DiningTable table, TableSession? session) => new()
        {
            Id = table.Id,
            Label = table.Label,
            Active = table.Active,
            ActiveSession = session is null ? null : await ToSessionDtoAsync(session)
        };

        private async Task<TableSessionDto> ToSessionDtoAsync(TableSession session)
        {
            var spent = await _orders.GetSessionSpentAsync(session.Id);
            var count = await _orders.CountSessionOrdersAsync(session.Id);
            var cap = session.SpendingCap ?? _security.MaxSpendPerSession;

            return new TableSessionDto
            {
                Id = session.Id,
                DiningTableId = session.DiningTableId,
                TableLabel = session.DiningTable?.Label ?? string.Empty,
                AccessToken = session.AccessToken,
                OpenedAt = session.OpenedAt,
                ExpiresAt = session.ExpiresAt,
                IsOpen = session.ClosedAt is null && DateTime.UtcNow < session.ExpiresAt,
                ClientPath = $"/mesa/{session.AccessToken}",
                SpendingCap = cap,
                Spent = spent,
                OrderCount = count
            };
        }
    }
}
