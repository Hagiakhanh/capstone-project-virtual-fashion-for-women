using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel;

public class CreateTryOnRequest
{
    public string? TopProductColorId { get; set; }
    public string? BottomProductColorId { get; set; }
    public IFormFile UserModelImage { get; set; }
}