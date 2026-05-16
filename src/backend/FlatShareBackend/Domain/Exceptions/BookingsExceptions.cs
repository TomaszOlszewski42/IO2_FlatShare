using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Domain.Exceptions;

public class OccupiedDateException(string msg, List<DateRange> dateRanges) : Exception(msg)
{
    public List<DateRange> DateRanges = dateRanges;
}

public class DateTooEarlyException(string msg) : Exception(msg);

public class InvalidBookingStateTransition(string msg) : Exception(msg);

public class InvalidDatesException(string msg) : Exception(msg);