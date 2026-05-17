namespace FlatShareBackend.Domain.Exceptions;

public class ForbiddenOperationException(string msg) : Exception(msg);