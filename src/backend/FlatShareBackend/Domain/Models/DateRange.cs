using System.ComponentModel;

namespace FlatShareBackend.Domain.Models;

public record DateRange
{
    public required DateOnly From {get; set;}
    public required DateOnly To {get; set;}
}
