using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductVariant
{
    public class ResponseProductVariantDto
    {
        public string ProductVariantId { get; set; }
        public int? SizeId { get; set; }
        public string VariantName { get; set; }
        public int? Quantity { get; set; }
        public string ImageUrl { get; set; }
        public string Status { get; set; }
        public decimal? ProductWeight { get; set; }
        public decimal? ProductLength { get; set; }
        public decimal? ProductWidth { get; set; }
        public decimal? ProductHeight { get; set; }
        public ResponseSizeDto Size { get; set; }
        public List<ResponseProductImageDto> ProductImages { get; set; } = new List<ResponseProductImageDto>();
    }

    public class ResponseSizeDto
    {
        public int SizeId { get; set; }
        public string SizeCode { get; set; }
    }

    public class ResponseProductImageDto
    {
        public int ProductImageId { get; set; }
        public string ImageUrl { get; set; }
    }
}
