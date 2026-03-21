using System.ComponentModel.DataAnnotations;

namespace FlatShareBackend.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Tenant;

        [Required]
        public UserStatus Status { get; set; } = UserStatus.Active;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
    }
}