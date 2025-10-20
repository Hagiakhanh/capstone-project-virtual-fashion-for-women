using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/product")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ResponseProductDto>>> GetAll([FromQuery] PaginationParameter pagination)
        {
            var result = await _productService.GetAllProductsAsync(pagination);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetProductBySlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                return BadRequest("Product slug is required");

            var product = await _productService.GetProductBySlugAsync(slug);

            if (product == null)
                return NotFound($"Product with slug '{slug}' not found");

            return Ok(product);
        }

        [HttpGet("id/{productId}")]
        public async Task<IActionResult> GetProductByID(string productId)
        {
            if (string.IsNullOrWhiteSpace(productId))
                return BadRequest("Product slug is required");

            var product = await _productService.GetProductByIdAsync(productId);

            if (product == null)
                return NotFound($"Product with slug '{productId}' not found");

            return Ok(product);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ResponseProductDto>>> Search([FromQuery] PaginationParameter pagination, [FromQuery] ProductSearchRequest request)
        {
            var result = await _productService.SearchProductAsync(request, pagination);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm]CreateProductRequest request)
        {
            var result = await _productService.CreateProductAsyncWithValidation(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("by-variant/{variantId}")]
        public async Task<IActionResult> GetProductByVariantId(string variantId)
        {
            if (string.IsNullOrWhiteSpace(variantId))
                return BadRequest("Product variant id is required");

            var product = await _productService.GetProductByVariantIdAsync(variantId);

            if (product == null)
                return NotFound($"Product with variant id '{variantId}' not found");

            return Ok(product);
        }

        [HttpGet("by-product-color/{productColorId}")]
        public async Task<IActionResult> GetProductByProductColorIdAsync(string productColorId)
        {
            if (string.IsNullOrWhiteSpace(productColorId))
                return BadRequest("Product variant id is required");

            var product = await _productService.GetProductByProductColorIdAsyncForTryOn(productColorId);

            if (product == null)
                return NotFound($"Product with variant id '{productColorId}' not found");

            return Ok(product);
        }

        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateAsync(string productId, [FromForm] UpdateProductRequest request)
        {
            try
            {
                MessageModelWithData<Product> result = await _productService.UpdateAsync(productId, request);

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteProduct(string productId)
        {
            try
            {
                MessageModel result = await _productService.DeleteProductAsync(productId, false);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}



