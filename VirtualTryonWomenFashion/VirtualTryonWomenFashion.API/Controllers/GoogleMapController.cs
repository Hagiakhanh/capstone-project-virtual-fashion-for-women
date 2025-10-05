using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class GoogleMapController : ControllerBase
{
    public readonly IGoogleMapService _googleMapService;

    public GoogleMapController(IGoogleMapService googleMapService)
    {
        _googleMapService = googleMapService;
    }
    
    [HttpGet("autocomplete-location")]
    public async Task<IActionResult> GetAutoCompleteLocation([FromQuery] string address)
    {
        var result = await _googleMapService.GetAutoCompleteLocation(address);
        return Ok(new MessageModelWithData<object>()
        {
            StatusCode = 200,
            Message = "Lấy địa chỉ thành công",
            Data = result
        });
    }

    [HttpPost("place/{placeId}")]
    public async Task<IActionResult> GetPlaceDetail([FromRoute] string placeId)
    {
        var result = await _googleMapService.GetPlaceDetail(placeId);
        return Ok(new MessageModelWithData<object>()
        {
            StatusCode = 200,
            Message = "Lấy địa chỉ chi tiết thành công",
            Data = result
        });
    }
}