namespace FlatShareBackend.Options
{
    public class PasswordResetOptions
    {
        public const string SectionName = "PasswordReset";

        public int TokenTtlMinutes { get; set; } = 30;
    }
}