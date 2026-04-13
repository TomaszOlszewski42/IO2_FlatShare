using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<UserSession> Sessions => Set<UserSession>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(x => x.Email).IsUnique();
                entity.Property(x => x.Role).HasConversion<string>();
                entity.Property(x => x.Status).HasConversion<string>();
            });

            modelBuilder.Entity<UserSession>(entity =>
            {
                entity.HasOne(x => x.User)
                    .WithMany(x => x.Sessions)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PasswordResetToken>(entity =>
            {
                entity.HasIndex(x => x.TokenHash).IsUnique();
                entity.HasIndex(x => x.UserId);

                entity.HasOne(x => x.User)
                    .WithMany(x => x.PasswordResetTokens)
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}