using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Domain.Exceptions;

public class OccupiedDateException(string msg, List<DateRange> dateRanges) : Exception(msg)
{
    public List<DateRange> DateRanges = dateRanges;
}