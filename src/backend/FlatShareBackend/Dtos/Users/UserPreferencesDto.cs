using FlatShareBackend.Models;

namespace FlatShareBackend.Dtos.Users;

public class UserPreferencesDto
{
    public UserPreferencesDto() {}
    public UserPreferencesDto(UserPreferences preferences)
    {
        PetsAllowed = preferences.PetsAllowed;
        SmokingAllowed = preferences.SmokingAllowed;
        MaxPrice = preferences.MaxPrice;
        Currency = preferences.Currency;
        PreferredDistricts = preferences.PreferredDistricts;
    }

   public decimal? MaxPrice { get; set; }
    public string? Currency { get; set; }
    public bool? SmokingAllowed { get; set; }
    public bool? PetsAllowed { get; set; }
    public List<string> PreferredDistricts { get; set; } = [];
}