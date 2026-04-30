namespace FlatShareBackend.Application.Services.FilesManagment;

public interface IFilesService
{
    public Task<Guid> UploadFromStream(Stream stream);
    public Task<Stream> GetFile(string filename);
}
