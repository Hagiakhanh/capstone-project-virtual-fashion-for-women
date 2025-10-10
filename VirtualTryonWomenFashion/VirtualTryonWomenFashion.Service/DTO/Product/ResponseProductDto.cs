using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.Product
{
    public class ResponseProductDto
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductSlug { get; set; }
        public decimal? Price { get; set; }
        public decimal? PriceAtTime { get; set; }
        public bool? IsInWishlist { get; set; }
        public string Description { get; set; }
        public string MainImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CategoryId { get; set; }
        public List<ResponseProductColorDto> ProductColors { get; set; } = new List<ResponseProductColorDto>();
    }

    public class ResponseProductWithListColorAndSizeDto
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductSlug { get; set; }
        public decimal? Price { get; set; }
        public decimal? PriceAtTime { get; set; }
        public bool? IsInWishlist { get; set; }
        public string Description { get; set; }
        public string MainImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CategoryId { get; set; }
        public List<ResponseColorDto> Color { get; set; }

        public List<ResponseSizeDto> SizeDto { get; set; }
        public List<ResponProductColorWithListSize> ProductColors { get; set; } = new List<ResponProductColorWithListSize>();
    }
}
