namespace FlatShareBackend.Dtos.Listings;

public record Address
{
    public required string City { get; init; }
    public required string District { get; init; }
    public required string Street { get; init; }
    public required string AptNumber { get; init; }
}