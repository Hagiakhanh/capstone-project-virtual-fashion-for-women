using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.DTO.UploadImageModel;

public class TryOnModel
{
    public Data.Models.ProductColor? TopImage { get; set; }
    public Data.Models.ProductColor? BottomImage { get; set; }
    public IFormFile UserModelImage { get; set; }
}