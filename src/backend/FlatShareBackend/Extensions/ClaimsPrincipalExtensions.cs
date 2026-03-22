using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FlatShareBackend.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static Guid GetRequiredUserId(this ClaimsPrincipal principal)
        {
            var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(value, out var userId))
            {
                throw new UnauthorizedAccessException("Missing or invalid user identifier in token.");
            }

            return userId;
        }

        public static Guid GetRequiredSessionId(this ClaimsPrincipal principal)
        {
            var value = principal.FindFirstValue("sid");

            if (!Guid.TryParse(value, out var sessionId))
            {
                throw new UnauthorizedAccessException("Missing or invalid session identifier in token.");
            }

            return sessionId;
        }
    }
}