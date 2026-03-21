namespace FlatShareBackend.Dtos.Auth
{
    public class SessionResponse
    {
        public string Token { get; set; } = string.Empty;
        public Guid SessionId { get; set; }
        public string Type { get; set; } = "Bearer";
        public int ExpiresIn { get; set; }
        public IReadOnlyCollection<string> Roles { get; set; } = Array.Empty<string>();
    }
}