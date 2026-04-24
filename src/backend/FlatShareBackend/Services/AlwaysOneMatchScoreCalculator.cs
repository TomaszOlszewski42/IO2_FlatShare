using System.Linq.Expressions;
using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public class AlwaysOneMatchScoreCalculator : IMatchScoreCalculator
{

    public Expression<Func<Listing, float>> GetScoreExpression(UserPreferences preferences)
    {
        return x => 1.0f;
    }
}