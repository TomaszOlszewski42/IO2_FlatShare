namespace FlatShareBackend.Exceptions;

public class InvalidIdException(string msg) : Exception(msg);

public class UnauthorizedDatabaseOperation(string msg) : Exception(msg);