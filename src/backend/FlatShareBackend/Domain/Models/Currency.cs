using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using FlatShareBackend.Application.Converters;

namespace FlatShareBackend.Domain.Models;

[JsonConverter(typeof(JsonEnumMemberConverter<Currency>))]
[TypeConverter(typeof(StringEnumCoverter))]
public enum Currency
{
    [EnumMember(Value = "PLN")]
    PLN,
    [EnumMember(Value = "EUR")]
    EUR
}