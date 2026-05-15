using System;

namespace FlatShareBackend.Domain.Models;

public class ListingOpinion
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Listing Listing { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    
    // Rating expressed in stars (1 to 5)
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}