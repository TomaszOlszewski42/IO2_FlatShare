using System.Text.Json.Serialization;
using FlatShareBackend.Application.Converters;

namespace FlatShareBackend.Domain.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserStatus
{
    Active,
    Blocked,
    Deleted,
    ResetRequested
}
