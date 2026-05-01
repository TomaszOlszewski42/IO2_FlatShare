namespace FlatShareBackend.Domain.Exceptions;

public class InvalidIdException(string msg) : Exception(msg);

public class UnauthorizedDatabaseOperation(string msg) : Exception(msg);

public class ListingValidationException(string msg) : Exception(msg);

public class DatabaseNotWorkingException(string msg) : Exception(msg);