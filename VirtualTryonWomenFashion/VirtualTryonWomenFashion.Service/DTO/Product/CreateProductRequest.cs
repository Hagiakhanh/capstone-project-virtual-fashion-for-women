using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;

namespace VirtualTryonWomenFashion.Service.DTO.Product
{
    public class CreateProductRequest
    {
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public IFormFile? MainImageUrl { get; set; }
        public int? CategoryId { get; set; }
        public List<CreateProductColorRequest> ProductColor { get; set; } = new List<CreateProductColorRequest> { };
        public List<int>? ExistingTagIds { get; set; } = new(); // Tag cũ
        public List<string>? NewTags { get; set; } = new(); // Tag mới
    }
}
