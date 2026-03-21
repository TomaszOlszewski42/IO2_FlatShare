using FlatShareBackend.Data;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Repositories
{
    public class SessionRepository : ISessionRepository
    {
        private readonly AppDbContext _dbContext;

        public SessionRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserSession> AddAsync(UserSession session, CancellationToken cancellationToken = default)
        {
            _dbContext.Sessions.Add(session);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return session;
        }

        public Task<UserSession?> GetByIdAsync(Guid sessionId, CancellationToken cancellationToken = default)
        {
            return _dbContext.Sessions
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}