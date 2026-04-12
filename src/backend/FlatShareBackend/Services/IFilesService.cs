namespace FlatShareBackend.Services;

public interface IFilesService
{
    public Task<Guid> UploadFromStream(Stream stream);
    public Task<Stream> GetFile(string filename);
}
