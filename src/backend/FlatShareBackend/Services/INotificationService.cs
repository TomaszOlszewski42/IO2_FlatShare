namespace FlatShareBackend.Services;

public interface INotificationService
{
    Task SendUserBannedNotificationAsync(Guid userId, string reason, CancellationToken cancellationToken = default);
    // Future notifications can be added here
}
