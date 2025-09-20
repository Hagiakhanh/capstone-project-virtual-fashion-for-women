using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.ProductColor
{
    public class UpdateProductColorDto
    {
        public string? ProductColorId { get; set; }
        public int? ColorId { get; set; } = 0;
        public IFormFile? NoBgImgUrl { get; set; }
        public string? LensId { get; set; }
        public List<IFormFile>? ProductVariantImages { get; set; } = new List<IFormFile>();
        public List<UpdateProductVariantRequest>? Variants { get; set; } = new List<UpdateProductVariantRequest> { };
        public string? ColorName { get; set; } = string.Empty;
        public string? ColorPrefix { get; set; } = string.Empty;
        public string? HexCode { get; set; } = string.Empty;
    }
}
