using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.DTO.UploadImageModel;

public class ImageModel
{
    public IFormFile ImageModelFile { get; set; }
}