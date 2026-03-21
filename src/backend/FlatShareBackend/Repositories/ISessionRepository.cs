using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories
{
    public interface ISessionRepository
    {
        Task<UserSession> AddAsync(UserSession session, CancellationToken cancellationToken = default);
        Task<UserSession?> GetByIdAsync(Guid sessionId, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}