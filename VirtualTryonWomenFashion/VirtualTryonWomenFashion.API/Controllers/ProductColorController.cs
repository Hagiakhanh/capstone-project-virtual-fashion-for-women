using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
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
                return NotFound($"ProductColor with slug '{id}' not found");

            return Ok(productColor);
        }
    }
}
