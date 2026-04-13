namespace FlatShareBackend.Dtos.Auth
{
    public class PasswordResetRequestResponse
    {
        public string Message { get; set; } = "If the account exists, a password reset email has been sent.";
    }
}