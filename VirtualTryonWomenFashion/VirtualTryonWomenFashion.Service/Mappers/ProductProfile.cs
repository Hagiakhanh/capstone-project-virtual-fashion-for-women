using AutoMapper;
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
    public class ProductProfile : Profile
    {
        public ProductProfile()
        {
            // Product -> ResponseProductDto
            CreateMap<Product, ResponseProductDto>()
                .ForMember(dest => dest.CategoryId,
                           opt => opt.MapFrom(src => src.CategoryId ?? 0)) // nullable -> int
                .ForMember(dest => dest.PriceAtTime,
                           opt => opt.Ignore()); // set riêng sau khi lấy sale campaign

            // Product -> ResponseProductWithListColorDto
            CreateMap<Product, ResponseProductWithListColorAndSizeDto>()
                .ForMember(dest => dest.CategoryId,
                           opt => opt.MapFrom(src => src.CategoryId ?? 0))
                // Lấy danh sách Color từ tất cả ProductColors
                .ForMember(dest => dest.Color,
                           opt => opt.MapFrom(src => src.ProductColors
                               .Where(pc => pc.Color != null)
                               .Select(pc => pc.Color)
                               .Distinct()
                               .ToList()))
                // Lấy danh sách Size từ tất cả ProductVariants
                .ForMember(dest => dest.SizeDto,
                           opt => opt.MapFrom(src => src.ProductColors
                               .SelectMany(pc => pc.ProductVariants)
                               .Where(pv => pv.Size != null)
                               .Select(pv => pv.Size)
                               .Distinct()
                               .ToList()))
                // ProductColors map sang ResponProductColorWithListSize
                .ForMember(dest => dest.ProductColors,
                           opt => opt.MapFrom(src => src.ProductColors))
                .ForMember(dest => dest.PriceAtTime,
                           opt => opt.Ignore()); // set riêng sau khi lấy sale campaign

            // ProductColor -> ResponseProductColorDto
            CreateMap<ProductColor, ResponseProductColorDto>();

            // ProductColor -> ResponProductColorWithListSize
            CreateMap<ProductColor, ResponProductColorWithListSize>()
                // Lấy SizeDto từ tất cả ProductVariants
                .ForMember(dest => dest.SizeDto,
                           opt => opt.MapFrom(src => src.ProductVariants
                               .Where(pv => pv.Size != null)
                               .Select(pv => pv.Size)
                               .Distinct()
                               .ToList()))
                .ForMember(dest => dest.ProductVariants,
                           opt => opt.MapFrom(src => src.ProductVariants));

            // Color -> ResponseColorDto
            CreateMap<Color, ResponseColorDto>();

            // Size -> ResponseSizeDto
            CreateMap<Size, ResponseSizeDto>();

            // ProductImage -> ResponseProductImageDto
            CreateMap<ProductImage, ResponseProductImageDto>();

            // ProductVariant -> ResponseProductVariantDto
            CreateMap<ProductVariant, ResponseProductVariantDto>()
                .ForMember(dest => dest.ProductImagesDto,
                           opt => opt.MapFrom(src => src.ProductColor.ProductImages))
                .ForMember(dest => dest.SizeDto,
                           opt => opt.MapFrom(src => src.Size))
                .ForMember(dest => dest.ColorDto,
                           opt => opt.MapFrom(src => src.ProductColor.Color));
        }
    }
}
