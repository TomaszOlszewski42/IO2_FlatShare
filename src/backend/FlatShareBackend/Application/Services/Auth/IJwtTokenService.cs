using FlatShareBackend.Domain.Models;
using FlatShareBackend.Models;

namespace FlatShareBackend.Application.Services.Auth
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user, UserSession session);
        int GetExpiresInSeconds();
        DateTime GetTokenExpirationUtc();
    }
}