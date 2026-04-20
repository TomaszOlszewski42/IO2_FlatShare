namespace FlatShareBackend.Dtos.Matches;

public class SearchPage
{
    public required int Size { get; set; }
    public required int Number { get; set; }
    public required int TotalElements { get; set; }
    public required int TotalPages { get; set; }
}
