using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/productVariant")]
    [ApiController]
    public class ProductVariantController : ControllerBase
    {
        private readonly IProductVariantService _productVariantService;

        public ProductVariantController(IProductVariantService productVariantService) 
        { 
            _productVariantService = productVariantService;
        }

        [HttpGet("mock")]
        public IActionResult GetMockProductVariants()
        {
            var mockVariants = new List<ProductVariant>
            {
                new ProductVariant
                {
                    ProductVariantId = "PV001",
                    ProductColorId = "C001",
                    SizeId = 1,
                    VariantName = "Áo sơ mi trắng - Size M",
                    Quantity = 50,
                    ImageUrl = "https://example.com/images/ao-so-mi-trang-m.jpg",
                    Status = "Available",
                    ProductWeight = 0.3m,
                    ProductLength = 30,
                    ProductWidth = 25,
                    ProductHeight = 3,
                    ProductColor = new ProductColor
                    {
                        ProductColorId = "C001",
                        ColorId = 1,
                        ProductId = "P001",
                        LensId = "lfgdshfskdjfhskdhfaskjhfksalhfkasjhfksjdhfkjs"
                    },
                    Size = new Size
                    {
                        SizeId = 1,
                        SizeCode = "M"
                    }
                },
                new ProductVariant
                {
                    ProductVariantId = "PV002",
                    ProductColorId = "C002",
                    SizeId = 2,
                    VariantName = "Váy hoa - Size L",
                    Quantity = 20,
                    ImageUrl = "https://example.com/images/vay-hoa-l.jpg",
                    Status = "Available",
                    ProductWeight = 0.5m,
                    ProductLength = 60,
                    ProductWidth = 40,
                    ProductHeight = 5,
                    ProductColor = new ProductColor
                    {
                        ProductColorId = "C002",
                        ColorId = 2,
                        ProductId = "P002",
                        LensId = "dhfksjhfkjsahfksahfklashfkldsahfklasf"
                    },
                    Size = new Size
                    {
                        SizeId = 2,
                        SizeCode = "L"
                    }
                }
            };

            return Ok(mockVariants);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync(string id, CreateProductVariantRequest request)
        {
            try
            {
                MessageModelWithData<ProductVariant> result = await _productVariantService.CreateAsync(id, request);

                return StatusCode(result.StatusCode, result);
            } catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
