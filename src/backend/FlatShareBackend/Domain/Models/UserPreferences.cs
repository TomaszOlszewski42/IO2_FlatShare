using FlatShareBackend.Application.Dtos.Users;

namespace FlatShareBackend.Domain.Models;

public class UserPreferences
{
    public decimal? MaxPrice { get; set; }
    public string? Currency { get; set; }
    public bool? SmokingAllowed { get; set; }
    public bool? PetsAllowed { get; set; }
    public List<string> PreferredDistricts { get; set; } = [];
    public required Guid OwnerId { get; set; }
    public User Owner { get; set; }

    public void UpdateFromDto(UserPreferencesDto dto)
    {
        MaxPrice = dto.MaxPrice;
        Currency = dto.Currency;
        SmokingAllowed = dto.SmokingAllowed;
        PetsAllowed = dto.PetsAllowed;
        PreferredDistricts = dto.PreferredDistricts;
    }
}
