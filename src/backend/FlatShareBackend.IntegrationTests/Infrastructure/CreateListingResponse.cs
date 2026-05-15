using System;

namespace FlatShareBackend.IntegrationTests.Infrastructure
{
    public class CreateListingResponse
    {
        public Guid ListingId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
