using FlatShareBackend.Domain.Models;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<UserSession> Sessions => Set<UserSession>();
        public DbSet<Listing> Listings => Set<Listing>();
        public DbSet<UserPreferences> UsersPreferences => Set<UserPreferences>();
        public DbSet<ViolationReport> ViolationReports => Set<ViolationReport>();
        public DbSet<ListingOpinion> ListingOpinions => Set<ListingOpinion>();
        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ListingOpinion>(entity =>
            {
                entity.HasKey(x => x.Id);
                
                entity.HasOne(x => x.Listing)
                    .WithMany()
                    .HasForeignKey(x => x.ListingId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ViolationReport>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.Property(x => x.TargetType).HasConversion<string>();
                entity.Property(x => x.Status).HasConversion<string>();

                entity.HasOne(x => x.Reporter)
                    .WithMany()
                    .HasForeignKey(x => x.ReporterId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.HandledBy)
                    .WithMany()
                    .HasForeignKey(x => x.HandledById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Listing>(entity =>
            {
                entity.HasIndex(x => x.Id).IsUnique();

                entity.HasOne(x => x.Owner)
                    .WithMany()
                    .HasForeignKey(x => x.OwnerId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                entity.OwnsOne(x => x.Location);
                
                entity.OwnsOne(x => x.Attributes);

                entity.OwnsMany(x => x.UnavailableDates);

                entity.OwnsMany(x => x.BookedDates);
            });

            modelBuilder.Entity<UserPreferences>(entity =>
            {
                entity.HasKey(up => up.OwnerId);

                entity.HasOne(x => x.Owner)
                    .WithOne()
                    .HasForeignKey<UserPreferences>(x => x.OwnerId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.Cascade);
            });

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

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasIndex(x => x.Id).IsUnique();
                
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(x => x.TenantId)
                    .IsRequired();

                entity.HasOne<Listing>()
                    .WithMany()
                    .HasForeignKey(x => x.ListingId)
                    .IsRequired();
                
                entity.OwnsOne(x => x.Payment, sa =>
                {
                    sa.Property(p => p.Currency).HasColumnName("Payment_Currency");
                    sa.Property(p => p.TotalValue).HasColumnName("Payment_TotalValue");
                    sa.Property(p => p.Status).HasColumnName("Payment_Status");
                    sa.Property(p => p.Id).HasColumnName("Payment_Id");
                })
                    .HasIndex(x => x.Id)
                    .IsUnique();
            });
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder
                .Properties<UserProfile>()
                .HaveConversion<string>();
        }
    }
}