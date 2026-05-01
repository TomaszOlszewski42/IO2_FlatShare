using System.Security.Claims;

namespace FlatShareBackend.Infrastructure.Extensions;

public static class GetUserIDFromHttp
{
    extension(IHttpContextAccessor accessor)
    {
        public Guid ParseUserID()
        {
            var context = accessor.HttpContext ?? throw new ArgumentNullException("HttpContext is null!");
            var sub = context.User.FindFirst(ClaimTypes.NameIdentifier) ?? throw new ArgumentNullException("No sub in Token");
            return Guid.Parse(sub.Value);
        }
    }
}
