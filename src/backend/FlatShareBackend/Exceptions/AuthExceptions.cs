namespace FlatShareBackend.Exceptions
{
    public class EmailAlreadyExistsException : Exception
    {
        public EmailAlreadyExistsException(string message) : base(message) { }
    }

    public class InvalidCredentialsException : Exception
    {
        public InvalidCredentialsException(string message) : base(message) { }
    }

    public class InactiveUserException : Exception
    {
        public InactiveUserException(string message) : base(message) { }
    }

    public class InvalidSessionException : Exception
    {
        public InvalidSessionException(string message) : base(message) { }
    }
}