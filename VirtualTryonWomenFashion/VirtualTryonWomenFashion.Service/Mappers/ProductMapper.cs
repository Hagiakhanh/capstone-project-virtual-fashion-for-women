using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public class ProductMapper
    {
        public ResponseProductDto MapToResponseProductDto(Product product, decimal salePrice)
        {
            return new ResponseProductDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductSlug = product.ProductSlug,
                Description = product.Description,
                MainImageUrl = product.MainImageUrl,
                IsDeleted = product.IsDeleted,
                CreatedAt = product.CreatedAt,
                CategoryId = product.Category.CategoryId,
                Price = product.Price,
                PriceAtTime = salePrice,
                ProductColors = product.ProductColors?.Select(pc => new ResponseProductColorDto
                {
                    ProductColorId = pc.ProductColorId,
                    ColorId = pc.ColorId,
                    NoBgImgUrl = pc.NoBgImgUrl,
                    LensId = pc.LensId,
                    PackageLens = pc.PackageLens,
                    Color = pc.Color != null ? new ResponseColorDto()
                    {
                        ColorId = pc.Color.ColorId,
                        ColorName = pc.Color.ColorName,
                        ColorPrefix = pc.Color.ColorPrefix,
                        HexCode = pc.Color.HexCode
                    } : null,
                    ProductImagesDto = pc.ProductImages?.Select(pi => new ResponseProductImageDto
                    {
                        ProductImageId = pi.ProductImageId,
                        ImageUrl = pi.ImageUrl
                    }).ToList() ?? new List<ResponseProductImageDto>(),
                    ProductVariants = pc.ProductVariants?.Select(pv => new ResponseProductVariantDto
                    {
                        ProductVariantId = pv.ProductVariantId,
                        SizeId = pv.SizeId,
                        VariantName = pv.VariantName,
                        Quantity = pv.Quantity,
                        ImageUrl = pv.ImageUrl,
                        Status = pv.Status,
                        ProductWeight = pv.ProductWeight,
                        ProductLength = pv.ProductLength,
                        ProductWidth = pv.ProductWidth,
                        ProductHeight = pv.ProductHeight,
                        SizeDto = pv.Size != null ? new ResponseSizeDto
                        {
                            SizeId = pv.Size.SizeId,
                            SizeCode = pv.Size.SizeCode
                        } : null
                    }).ToList() ?? new List<ResponseProductVariantDto>()
                }).ToList() ?? new List<ResponseProductColorDto>(),
                Tags = product.Tags?.Select(tag => new TagDto
                {
                    TagId = tag.TagId,
                    TagName = tag.TagName
                }).ToList() ?? new List<TagDto>()
            };
        }
    }
}
