namespace FlatShareBackend.Domain.Exceptions;

public class UserNotFoundException(Guid userId) : Exception($"User with ID {userId} not found.");
