using System;

namespace FlatShareBackend.Application.Dtos.Listings;

public class ListingOpinionDto
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}