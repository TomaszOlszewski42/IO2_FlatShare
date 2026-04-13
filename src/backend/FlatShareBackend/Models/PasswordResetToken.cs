using System.ComponentModel.DataAnnotations;

namespace FlatShareBackend.Models
{
    public class PasswordResetToken
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;

        [Required]
        [MaxLength(64)]
        public string TokenHash { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiresAtUtc { get; set; }

        public DateTime? UsedAtUtc { get; set; }
    }
}