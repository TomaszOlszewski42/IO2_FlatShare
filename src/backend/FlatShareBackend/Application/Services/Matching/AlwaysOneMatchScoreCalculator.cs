using System.Linq.Expressions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Matching;

public class AlwaysOneMatchScoreCalculator : IMatchScoreCalculator
{

    public Expression<Func<Listing, float>> GetScoreExpression(UserPreferences preferences)
    {
        return x => 1.0f;
    }
}