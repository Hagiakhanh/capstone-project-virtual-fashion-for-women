using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductVariant
{
    public class CreateProductVariantRequest
    {
        public int SizeId { get; set; } = 0;
        public string VariantName { get; set; }
        public int Quantity { get; set; }
        public double ClothesLength { get; set; }
        public IFormFile? ImageUrl { get; set; }
        public decimal ProductWeight { get; set; }
        public decimal ProductLength { get; set; }
        public decimal ProductWidth { get; set; }
        public decimal ProductHeight { get; set; }
        //public string? SizeCode { get; set; } = string.Empty;
    }
}
