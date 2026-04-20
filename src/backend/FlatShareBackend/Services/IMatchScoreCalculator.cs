using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public interface IMatchScoreCalculator
{
    public float Calculate(Listing listing, UserPreferences preferences);
}
