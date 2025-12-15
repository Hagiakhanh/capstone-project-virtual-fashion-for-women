using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/shipping-region")]
    [ApiController]
    public class ShippingRegionController : ControllerBase
    {
        private IShippingRegionService _shippingRegionService;
        public ShippingRegionController(IShippingRegionService shippingRegionService)
        {
            _shippingRegionService = shippingRegionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetShippingRegionAsync() 
        {
            var shippingRegion = await _shippingRegionService.GetShippingRegionAsync();
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy giá vận chuyển",
                StatusCode = 200,
                Data = shippingRegion
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateShippingRegionAsync([FromBody] List<ShippingRegion> shippingRegionsRequest)
        {
            try
            {
                var result = await _shippingRegionService.UpdateShippingRegionAsync(shippingRegionsRequest);
                if(result)
                {
                    return Ok(new MessageModelWithData<object>()
                    {
                        Message = "Cập nhật giá vận chuyển thành công",
                        StatusCode = StatusCodes.Status200OK,
                        Data = null
                    });
                }
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Cập nhật giá vận chuyển thất bại",
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });

            }
            catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Cập nhật giá vận chuyển thất bại: " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }
        }
    }
}
