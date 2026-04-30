using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Auth
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user, UserSession session);
        int GetExpiresInSeconds();
        DateTime GetTokenExpirationUtc();
    }
}