namespace FlatShareBackend.Dtos.Common
{
    public class ApiErrorResponse
    {
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int Status { get; set; }
        public string Error { get; set; } = string.Empty;
        public string? Message { get; set; }
        public List<ApiFieldError>? FieldErrors { get; set; }
    }

    public class ApiFieldError
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}