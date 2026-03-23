namespace FlatShareBackend.Dtos.Users
{
    public class RegisterUserResponse
    {
        public string Message { get; set; } = string.Empty;
        public UserDto User { get; set; } = new();
    }
}