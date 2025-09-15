using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.IServices;

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

        [HttpGet("mock")]
        public IActionResult GetMockProducts()
        {
            var mockProducts = new List<Product>
            {
                new Product
                {
                    ProductId = "P001",
                    ProductName = "Áo sơ mi trắng",
                    ProductSlug = "ao-so-mi-trang",
                    Description = "Áo sơ mi cotton cao cấp",
                    IsDeleted = false,
                    MainImageUrl = "https://example.com/images/ao-so-mi-trang.jpg",
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    CategoryId = 1,
                    Category = new Category
                    {
                        CategoryId = 1,
                        CategoryName = "Áo",
                        CategorySlug = "ao",
                        BodyPart = "upperBody"
                    }
                },
                new Product
                {
                    ProductId = "P002",
                    ProductName = "Váy hoa",
                    ProductSlug = "vay-hoa",
                    Description = "Váy hoa mùa hè",
                    IsDeleted = false,
                    MainImageUrl = "https://example.com/images/vay-hoa.jpg",
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    CategoryId = 2,
                    Category = new Category
                    {
                        CategoryId = 2,
                        CategoryName = "Váy",
                        CategorySlug = "vay",
                        BodyPart = "underbody"
                    }
                }
            };

            return Ok(mockProducts);
        }
    }
}



