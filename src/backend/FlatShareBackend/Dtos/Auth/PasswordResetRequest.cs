using System.ComponentModel.DataAnnotations;

namespace FlatShareBackend.Dtos.Auth
{
    public class PasswordResetRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
    }
}