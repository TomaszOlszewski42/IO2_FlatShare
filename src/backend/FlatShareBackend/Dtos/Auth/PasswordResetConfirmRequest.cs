using System.ComponentModel.DataAnnotations;

namespace FlatShareBackend.Dtos.Auth
{
    public class PasswordResetConfirmRequest
    {
        [Required]
        [MaxLength(512)]
        public string ResetToken { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        [MaxLength(200)]
        public string NewPassword { get; set; } = string.Empty;
    }
}