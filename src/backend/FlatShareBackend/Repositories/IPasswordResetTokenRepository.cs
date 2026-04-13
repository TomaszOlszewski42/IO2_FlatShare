using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories
{
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken> AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
        Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}