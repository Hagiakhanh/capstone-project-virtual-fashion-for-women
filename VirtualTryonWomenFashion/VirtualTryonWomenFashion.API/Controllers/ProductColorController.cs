using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/productColor")]
    [ApiController]
    public class ProductColorController : ControllerBase
    {
        private readonly IProductColorService _productColorService;

        public ProductColorController(IProductColorService productColorService)
        {
            _productColorService = productColorService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(string productId, CreateProductColorRequest request)
        {
            try
            {
                MessageModelWithData<ProductColor> result = await _productColorService.CreateAsync(productId, request);

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductColorById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("ProductColor id is required");

            var productColor = await _productColorService.GetProductColorByIdAsync(id);

            if (productColor == null)
                return NotFound($"ProductColor with '{id}' not found");

            return Ok(productColor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(string id, UpdateProductColorDto request)
        {
            try
            {
                MessageModelWithData<ProductColor> result = await _productColorService.UpdateAsync(id, request);

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                MessageModel result = await _productColorService.DeleteAsync(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpGet("by-lens-id/{lensId}")]
        public async Task<IActionResult> GetProductColorByLensId([FromRoute] string lensId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(lensId))
                    return BadRequest("Lens id is required");

                var productColorResponse = await _productColorService.GetProductColorByLensId(lensId);

                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Lấy product color theo lensId thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = productColorResponse
                });
            }
            catch (Exception ex)
            {
                return BadRequest( new MessageModelWithData<object>()
                {
                    Message = "Lỗi khi lấy product color theo lensId: "+ ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }
            
        }
    }
}
