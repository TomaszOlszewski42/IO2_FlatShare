using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using FlatShareBackend.Application.Converters;

namespace FlatShareBackend.Domain.Models;

[JsonConverter(typeof(JsonEnumMemberConverter<UserProfile>))]
[TypeConverter(typeof(JsonStringEnumConverter))]
public enum UserProfile
{
    [EnumMember(Value = "student")]
    Student,
    [EnumMember(Value = "tourist")]
    Tourist,
    [EnumMember(Value = "workingPerson")]
    WorkingPerson,
    [EnumMember(Value = "none")]
    None
}
