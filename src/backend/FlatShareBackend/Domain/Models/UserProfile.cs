using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using FlatShareBackend.Application.Converters;

namespace FlatShareBackend.AgregationClasses;

[JsonConverter(typeof(JsonEnumMemberConverter<UserProfile>))]
[TypeConverter(typeof(JsonStringEnumConverter))]
public enum UserProfile
{
    [EnumMember(Value = "student")]
    Student
}
