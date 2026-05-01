namespace FlatShareBackend.Domain.Exceptions;

public class InvalidPageNumberException(string msg) : Exception(msg);