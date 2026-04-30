using System.Runtime.Serialization;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Reflection;

namespace FlatShareBackend.AgregationClasses;

public class JsonEnumMemberConverter<T> : JsonConverter<T> where T : struct, Enum
{
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        foreach (var field in typeToConvert.GetFields())
        {
            var attribute = field.GetCustomAttribute<EnumMemberAttribute>();
            if (attribute?.Value == value || field.Name == value)
            {
                return (T)field.GetValue(null)!;
            }
        }
        throw new JsonException($"Nie można sparsować {value} na enum {typeToConvert.Name}");
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field?.GetCustomAttribute<EnumMemberAttribute>();
        writer.WriteStringValue(attribute?.Value ?? value.ToString());
    }
}
