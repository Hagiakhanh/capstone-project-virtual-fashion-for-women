using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files);
    }
}
