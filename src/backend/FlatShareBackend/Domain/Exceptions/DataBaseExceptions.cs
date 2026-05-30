namespace FlatShareBackend.Domain.Exceptions;

public class InvalidIdException(string msg) : Exception(msg);

public class UnauthorizedDatabaseOperation(string msg) : Exception(msg);

public class ListingValidationException(string msg, List<(string field, string message)> violations) : Exception(msg)
{
    public List<(string field, string message)> FieldErrors { get; set; } = violations;
}

public class DatabaseNotWorkingException(string msg) : Exception(msg);

public class UnavailabilityErrorException(string msg) : Exception(msg);