using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files);
        Task<DeletionResult> DeleteImageAsync(string imageUrl);
        Task<Dictionary<string, string>> DeleteMultipleImagesAsync(List<string> imageUrls);
        Task<string> UploadImageFromUrlAsync(string imageUrl);
    }
}
