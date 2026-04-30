using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Runtime.Serialization;

namespace FlatShareBackend.AgregationClasses;

//https://stackoverflow.com/questions/72886747/deserialize-enums-using-the-enummember-value-in-aspnet-fromquery-model-binding
public class StringEnumCoverter : EnumConverter
{
    public StringEnumCoverter([
        DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicParameterlessConstructor | 
        DynamicallyAccessedMemberTypes.PublicFields)] Type type) : base(type)
    {
    }

    public override object? ConvertFrom(ITypeDescriptorContext? context, CultureInfo? culture, object value)
    {
        if (value is string strValue)
        {
            try
            {
                foreach (var name in Enum.GetNames(EnumType))
                {
                    var field = EnumType.GetField(name);
                    if (field != null)
                    {
                        var enumMember = (EnumMemberAttribute)(
                            field.GetCustomAttributes(typeof(EnumMemberAttribute), true).Single()
                            );
                        if (strValue.Equals(enumMember.Value, StringComparison.OrdinalIgnoreCase))
                        {
                            return Enum.Parse(EnumType, name, true);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw new FormatException((string)value, e);
            }
        }

        return base.ConvertFrom(context, culture, value);
    }
}
