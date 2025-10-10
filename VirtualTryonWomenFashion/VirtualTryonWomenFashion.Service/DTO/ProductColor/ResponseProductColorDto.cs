using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.ProductColor
{
    public class ResponseProductColorDto
    {
        public string ProductColorId { get; set; }
        public int? ColorId { get; set; }
        public string LensId { get; set; }
        public ResponseColorDto Color { get; set; }
        public List<ResponseProductVariantDto> ProductVariants { get; set; } = new List<ResponseProductVariantDto>();
    }

    public class ResponProductColorWithListSize
    {
        public string ProductColorId { get; set; }
        public int? ColorId { get; set; }
        public string LensId { get; set; }
        public List<ResponseSizeDto> SizeDto { get; set; }
        public List<ResponseProductImageDto> ProductImagesDto { get; set; } = new List<ResponseProductImageDto>();
        public List<ResponseProductVariantNoListImageDto> ProductVariants { get; set; } = new List<ResponseProductVariantNoListImageDto>();
    }
}
