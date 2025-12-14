using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
    }
}
