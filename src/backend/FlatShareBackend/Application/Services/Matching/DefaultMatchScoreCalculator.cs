using System.Linq.Expressions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Matching;

public class DefaultMatchScoreCalculator : IMatchScoreCalculator
{
    public Expression<Func<Listing, float>> GetScoreExpression(UserPreferences preferences)
    {
        // Wagi poszczególnych cech (suma = 1.0f)
        const float priceWeight = 0.4f;
        const float districtWeight = 0.2f;
        const float petsWeight = 0.2f;
        const float smokingWeight = 0.2f;

        var hasMaxPrice = preferences.MaxPrice.HasValue;
        var maxPrice = preferences.MaxPrice ?? decimal.MaxValue;
        
        var hasCurrency = !string.IsNullOrEmpty(preferences.Currency);
        var prefCurrency = preferences.Currency ?? string.Empty;

        // Jeśli lokator ma/chce mieć zwierzę, szukamy mieszkań, które na to pozwalają
        var needsPets = preferences.PetsAllowed == true;

        // Jeśli lokator pali, musi unikać mieszkań z "NonSmokingOnly"
        var smokes = preferences.SmokingAllowed == true;

        var preferredDistricts = preferences.PreferredDistricts ?? new List<string>();
        var hasDistricts = preferredDistricts.Any();

        return listing => 
            // 1. Ocena ceny (i waluty)
            (
                (!hasMaxPrice || listing.Price <= maxPrice) && 
                (!hasCurrency || listing.Currency == prefCurrency) 
                ? priceWeight : 0.0f
            ) +
            // 2. Ocena lokalizacji (Dzielnica)
            (
                (!hasDistricts || preferredDistricts.Contains(listing.Location.District))
                ? districtWeight : 0.0f
            ) +
            // 3. Ocena zwierząt
            (
                (!needsPets || listing.Attributes.PetsAllowed)
                ? petsWeight : 0.0f
            ) +
            // 4. Ocena palenia
            (
                (!smokes || !listing.Attributes.NonSmokingOnly)
                ? smokingWeight : 0.0f
            );
    }
}