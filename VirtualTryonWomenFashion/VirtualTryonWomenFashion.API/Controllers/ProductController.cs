using MailKit.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Org.BouncyCastle.Ocsp;
using System.Globalization;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Order;
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
        private readonly ILogger<ProductController> _logger;

        public ProductController(IProductService productService, ILogger<ProductController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts(
            [FromQuery] PaginationParameter pagination,
            [FromQuery] string? searchTerm,
            [FromQuery] string? status,
            [FromQuery] ProductSortEnum? sortBy,
            [FromQuery] int? categoryId)
        {
            try
            {
                MessageModelWithData<Pagination<ResponseProductDto>> result = await _productService.GetAllProducts(pagination, searchTerm, status, sortBy, categoryId);

                // Metadata cho client (Next.js)
                var metadata = new
                {
                    result.Data.TotalCount,
                    result.Data.PageSize,
                    result.Data.CurrentPage,
                    result.Data.TotalPages
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách sản phẩm", Error = ex.Message });
            }
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
        public async Task<IActionResult> Search([FromQuery] PaginationParameter pagination, [FromQuery] ProductSearchRequest request)
        {
            try
            {
                MessageModelWithData<Pagination<ResponseProductDto>> result = await _productService.SearchProductAsync(request, pagination);

                // Metadata cho client (Next.js)
                var metadata = new
                {
                    result.Data.TotalCount,
                    result.Data.PageSize,
                    result.Data.CurrentPage,
                    result.Data.TotalPages
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Đã xảy ra lỗi khi lấy danh sách sản phẩm", Error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromForm]CreateProductRequest request)
        {
            try
            {
                var result = await _productService.CreateProductAsyncWithValidation(request);
                return StatusCode(result.StatusCode, result);
            }
            catch(InvalidOperationException e)
            {
                return StatusCode(400, e.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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

        [HttpGet("recommended-color/{hexcode}")]
        public async Task<IActionResult> GetProductWithColorRecommentAsync([FromRoute]string hexcode, [FromQuery] string? categoryName, [FromQuery]PaginationParameter pagination)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(hexcode))
                    return BadRequest("Hexcode id is required");

                var product = await _productService.GetProductWithColorRecommentAsync(pagination, hexcode, categoryName);

                if (product == null)
                    return NotFound($"Product with hexcode recommend '{hexcode}' not found");

                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
    }
}



