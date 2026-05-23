using System.Text.Json.Serialization;

namespace FlatShareBackend.Domain.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentStatus
{
    Initiated,
    Redirected,
    Succeeded,
    Failed,
    Cancelled
}
