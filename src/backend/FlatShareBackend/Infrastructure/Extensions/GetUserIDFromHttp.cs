using System.Security.Claims;
using FlatShareBackend.Domain.Models;

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

public class InvalidCurrencyException(string msg): Exception(msg);

public static class ParseCurrencyFromString
{
    extension(Currency currency)
    {
        public Currency TryParse(string value)
        {
            return value.ToUpper() switch
            {
                "PLN" => Currency.PLN,
                "EUR" => Currency.EUR,
                _ => throw new InvalidCurrencyException($"{value} is not valid currency"),
            };
        }
    }
}