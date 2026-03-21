using System.ComponentModel.DataAnnotations;

namespace FlatShareBackend.Dtos.Auth
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Password { get; set; } = string.Empty;
    }
}