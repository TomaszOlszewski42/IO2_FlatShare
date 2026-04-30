namespace FlatShareBackend.Domain.Exceptions;

public class EmailAlreadyExistsException(string message) : Exception(message);

public class InvalidCredentialsException(string message) : Exception(message);

public class InactiveUserException(string message) : Exception(message);

public class InvalidSessionException(string message) : Exception(message);

public class InvalidRoleException(string message) : Exception(message);