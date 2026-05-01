using System.ComponentModel.DataAnnotations;
using FlatShareBackend.Models;

namespace FlatShareBackend.Dtos.Reports;

public class CreateViolationReportRequest
{
    [Required]
    public ViolationTargetType Type { get; set; }

    [Required]
    public Guid TargetId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public required string Reason { get; set; }

    [StringLength(1000)]
    public string? Details { get; set; }
}

public class ViolationReportDto
{
    public Guid Id { get; set; }
    public ViolationTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterEmail { get; set; } = null!;
    public required string Reason { get; set; }
    public string? Details { get; set; }
    public ViolationReportStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? HandledByEmail { get; set; }
    public DateTime? HandledAt { get; set; }
}

public class CreateViolationReportResponse
{
    public Guid Id { get; set; }
    public string Message { get; set; } = "Zgłoszenie zostało przyjęte.";
}

public class BanUserRequest
{
    [Required]
    public required string Reason { get; set; }
}
