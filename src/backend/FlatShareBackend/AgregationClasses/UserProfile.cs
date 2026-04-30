using System.ComponentModel;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace FlatShareBackend.AgregationClasses;

[JsonConverter(typeof(JsonEnumMemberConverter<UserProfile>))]
[TypeConverter(typeof(StringEnumCoverter))]
public enum UserProfile
{
    [EnumMember(Value = "student")]
    Student
}
