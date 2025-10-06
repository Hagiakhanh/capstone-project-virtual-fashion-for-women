using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;

namespace VirtualTryonWomenFashion.Service.DTO.Product
{
    public class UpdateProductRequest
    {
        public string? ProductName { get; set; }

        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public IFormFile? MainImageUrl { get; set; }

        public int? CategoryId { get; set; }

        public List<UpdateProductColorDto>? ProductColor { get; set; } = new List<UpdateProductColorDto> { };
    }
}
