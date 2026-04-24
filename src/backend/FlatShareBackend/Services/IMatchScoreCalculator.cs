using System.Linq.Expressions;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace FlatShareBackend.Services;

public interface IMatchScoreCalculator
{
    // returns lambda expression, for example
    // return x => 
    //         ((x.Price <= pref.MaxPrice ? 1.0 : 0.0) * pref.PriceWeight) +
    //         ((x.City == pref.City ? 1.0 : 0.0) * pref.LocationWeight);
    public Expression<Func<Listing, float>> GetScoreExpression(UserPreferences preferences);
}
