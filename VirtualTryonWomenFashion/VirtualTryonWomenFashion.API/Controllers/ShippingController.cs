using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class ShippingController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public ShippingController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpGet("get-province")]
    public async Task<IActionResult> GetProvince()
    {
        var result = await _shippingService.GetProvinceName();
        return Ok(new MessageModelWithData<object>()
        {
            StatusCode = StatusCodes.Status200OK,
            Message = "Get province successfully",
            Data = result
        });
    }
    
    [HttpGet("get-district/{provinceId}")]
    public async Task<IActionResult> GetDistrict(int provinceId)
    {
        var result = await _shippingService.GetDistrictName(provinceId);
        return Ok(new MessageModelWithData<object>()
        {
            StatusCode = StatusCodes.Status200OK,
            Message = "Get district successfully",
            Data = result
        });
    }
    
    [HttpGet("get-ward/{districtId}")]
    public async Task<IActionResult> GetWard(int districtId)
    {
        var result = await _shippingService.GetWardName(districtId);
        return Ok(new MessageModelWithData<object>()
        {
            StatusCode = StatusCodes.Status200OK,
            Message = "Get ward successfully",
            Data = result
        });
    }
}