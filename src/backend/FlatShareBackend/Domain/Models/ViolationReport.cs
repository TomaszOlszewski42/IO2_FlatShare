namespace FlatShareBackend.Domain.Models;

public enum ViolationReportStatus
{
    Open,
    UnderReview,
    ActionTaken,
    ClosedNoAction
}

public enum ViolationTargetType
{
    LISTING,
    USER
}

public class ViolationReport
{
    public Guid Id { get; set; }
    public required ViolationTargetType TargetType { get; set; }
    public required Guid TargetId { get; set; }
    public required Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;
    public required string Reason { get; set; }
    public string? Details { get; set; }
    public ViolationReportStatus Status { get; set; } = ViolationReportStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? HandledById { get; set; }
    public User? HandledBy { get; set; }
    public DateTime? HandledAt { get; set; }
}
