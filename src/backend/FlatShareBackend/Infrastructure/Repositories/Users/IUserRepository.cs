using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Infrastructure.Repositories.Users
{
    public interface IUserRepository
    {
        Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<User> AddAsync(User user, CancellationToken cancellationToken = default);
    }
}