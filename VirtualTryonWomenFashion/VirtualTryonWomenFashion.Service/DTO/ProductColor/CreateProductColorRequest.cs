using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.ProductColor
{
    public class CreateProductColorRequest
    {
        public int ColorId { get; set; } = 0;
        public IFormFile? NoBgImgUrl { get; set; }
        public string? LensId { get; set; }
        public string? PackageLens { get; set; }
        public List<IFormFile>? ProductVariantImages { get; set; } = new List<IFormFile> { };
        public List<CreateProductVariantRequest> Variants { get; set; } = new List<CreateProductVariantRequest> { };
        public string? ColorName { get; set; } = string.Empty;
        public string? ColorPrefix { get; set; } = string.Empty;
        public string? HexCode { get; set; } = string.Empty;
    }
}
