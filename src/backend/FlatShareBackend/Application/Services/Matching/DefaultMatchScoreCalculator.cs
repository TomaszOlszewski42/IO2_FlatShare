using System.Linq.Expressions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Matching;

public class DefaultMatchScoreCalculator : IMatchScoreCalculator
{
    // Ustalone wagi do dopasowań:
    private const float PriceWeight = 0.4f;
    private const float LocationWeight = 0.3f;
    private const float PetsWeight = 0.15f;
    private const float SmokingWeight = 0.15f;

    public Expression<Func<Listing, float>> GetScoreExpression(UserPreferences preferences)
    {
        // Wyciągamy zmienne przed predykat, żeby Expression Tree dla Entity Frameworka 
        // nie miało problemów z tłumaczeniem metod takich jak np. `.HasValue` 
        // na zapytanie bazodanowe.
        
        bool hasMaxPrice = preferences.MaxPrice.HasValue;
        decimal maxPrice = preferences.MaxPrice ?? 0m;

        bool hasPetsPreference = preferences.PetsAllowed.HasValue;
        bool petsAllowedPref = preferences.PetsAllowed ?? false;

        bool hasSmokingPreference = preferences.SmokingAllowed.HasValue;
        // W ogłoszeniach (Listing) trzymamy "NonSmokingOnly", u użytkownika trzymamy "SmokingAllowed"
        // Więc jeśli palenie jest DOZWOLONE ze strony użytkownika (true), 
        // nie powinno to być mieszkanie przeznaczone tylko dla niepalących.
        bool nonSmokingPref = hasSmokingPreference && !preferences.SmokingAllowed!.Value;

        var districts = preferences.PreferredDistricts ?? new List<string>();
        bool hasDistrictPreference = districts.Count > 0;

        return listing =>
            // Dopasowanie ceny (cena ogłoszenia musi być mniejsza lub równa maksymalnej na jaką pozwala lokator)
            (!hasMaxPrice || listing.Price <= maxPrice ? PriceWeight : 0.0f) +

            // Dopasowanie dzielnicy (dzielnica ogłoszenia musi być na liście preferowanych)
            (!hasDistrictPreference || districts.Contains(listing.Location.District) ? LocationWeight : 0.0f) +

            // Dopasowanie podejścia do zwierząt
            (!hasPetsPreference || listing.Attributes.PetsAllowed == petsAllowedPref ? PetsWeight : 0.0f) +

            // Dopasowanie podejścia do palenia
            (!hasSmokingPreference || listing.Attributes.NonSmokingOnly == nonSmokingPref ? SmokingWeight : 0.0f);
    }
}