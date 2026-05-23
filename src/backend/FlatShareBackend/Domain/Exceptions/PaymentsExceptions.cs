namespace FlatShareBackend.Domain.Exceptions;

public class NullPaymentException(string msg) : Exception(msg);