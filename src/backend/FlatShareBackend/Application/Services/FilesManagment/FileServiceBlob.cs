using Azure.Storage.Blobs;

namespace FlatShareBackend.Application.Services.FilesManagment;

public class FileServiceBlob : IFilesService
{
    private readonly BlobContainerClient _containerClient;

    public FileServiceBlob(BlobContainerClient containerClient)
    {
        _containerClient = containerClient;
    }

    public async Task<Guid> UploadFromStream(Stream stream)
    {
        await _containerClient.CreateIfNotExistsAsync();
        var guid = Guid.NewGuid();
        var blobClient = _containerClient.GetBlobClient($"{guid}");
        await blobClient.UploadAsync(stream);
        return guid;
    }

    public async Task<Stream> GetFile(string filename)
    {
        var blobClient = _containerClient.GetBlobClient(filename);
        var response = await blobClient.DownloadStreamingAsync();
        return response.Value.Content;
    }
}
