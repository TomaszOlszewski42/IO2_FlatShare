using System;

namespace FlatShareBackend.Application.Dtos.Listings;

public class AddListingOpinionRequest
{
    public Guid ListingId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
}