namespace FlatShareBackend.AgregationClasses;

public class PagingQueryArgs
{
    public PagingQueryArgs(PagingArgs args)
    {
        City = args.City;
        District = args.District;
        MinPrice = args.MinPrice;
        MaxPrice = args.MaxPrice;
        NonSmokingOnly = args.NonSmokingOnly;
        PetsAllowed = args.PetsAllowed;
        CloseToShops = args.CloseToShops;
        Profile = args.Profile;
        MinArea = args.MinArea;
        MaxArea = args.MaxArea;
        StartDate = args.StartDate;
    }

    public string? City { get; set; }
    public string? District { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? NonSmokingOnly { get; set; }
    public bool? PetsAllowed { get; set; }
    public bool? CloseToShops { get; set; }
    public string? Profile { get; set; }
    public decimal? MinArea { get; set; }
    public decimal? MaxArea { get; set; }
    public DateOnly? StartDate { get; set; }
}