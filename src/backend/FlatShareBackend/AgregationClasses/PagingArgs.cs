namespace FlatShareBackend.AgregationClasses;

public class PagingArgs
{
    public required int Page { get; set; } 
    public required int Size { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? PetsAllowed { get; set; } 
    public bool? NonSmokingOnly { get; set; }
    public bool? CloseToShops { get; set; }
    public string? Profile { get; set; }
    public decimal? MinArea { get; set; }
    public decimal? MaxArea { get; set; }
    public DateOnly? StartDate { get; set; }
}