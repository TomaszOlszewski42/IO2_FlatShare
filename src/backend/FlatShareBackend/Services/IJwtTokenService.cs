using FlatShareBackend.Models;

namespace FlatShareBackend.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user, UserSession session);
        int GetExpiresInSeconds();
        DateTime GetTokenExpirationUtc();
    }
}