namespace FlatShareBackend.Domain.Exceptions;

public class FrobiddednOperationException(string msg) : Exception(msg);