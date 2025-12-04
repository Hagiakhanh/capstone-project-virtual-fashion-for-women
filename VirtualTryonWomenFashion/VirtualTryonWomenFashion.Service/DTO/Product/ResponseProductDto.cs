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
        public bool? IsDeleted { get; set; }
        public string Description { get; set; }
        public string MainImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CategoryId { get; set; }
        public List<ResponseProductColorDto> ProductColors { get; set; } = new List<ResponseProductColorDto>();
        public List<TagDto> Tags { get; set; } = new List<TagDto>(); 
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
        public string BodyPart { get; set; }
        public List<ResponseColorDto> Color { get; set; }
        public List<ResponseSizeDto> SizeDto { get; set; }
        public List<ResponeProductColorWithListSize> ProductColors { get; set; } = new List<ResponeProductColorWithListSize>();
    }

    public class TagDto
    {
        public int? TagId { get; set; }
        public string TagName { get; set; }
    }
}
