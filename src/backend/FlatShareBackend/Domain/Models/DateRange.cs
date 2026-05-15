using System.ComponentModel;

namespace FlatShareBackend.Domain.Models;

public record DateRange
{
    public required DateOnly Since { get; set; }
    public required DateOnly Until { get; set; }
    public required string Message { get; set; }
}
