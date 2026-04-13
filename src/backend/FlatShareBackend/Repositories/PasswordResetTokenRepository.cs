using FlatShareBackend.Data;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly AppDbContext _dbContext;

        public PasswordResetTokenRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<PasswordResetToken> AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
        {
            _dbContext.PasswordResetTokens.Add(token);
            await _dbContext.SaveChangesAsync(cancellationToken);
            return token;
        }

        public Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
        {
            return _dbContext.PasswordResetTokens
                .Include(x => x.User)
                .SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}