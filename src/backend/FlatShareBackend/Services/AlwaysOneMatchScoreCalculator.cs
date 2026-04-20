using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public class AlwaysOneMatchScoreCalculator : IMatchScoreCalculator
{
    public float Calculate(Listing listing, UserPreferences preferences)
    {
        return 1.0f;
    }
}