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

            // ProductColor -> ResponseProductColorDto
            CreateMap<ProductColor, ResponseProductColorDto>();

            // Color -> ResponseColorDto
            CreateMap<Color, ResponseColorDto>();

            // ProductVariant -> ResponseProductVariantDto
            CreateMap<ProductVariant, ResponseProductVariantDto>()
                .ForMember(dest => dest.ProductImagesDto,
                           opt => opt.MapFrom(src => src.ProductColor.ProductImages));

            // Size -> ResponseSizeDto
            CreateMap<Size, ResponseSizeDto>();

            // ProductImage -> ResponseProductImageDto
            CreateMap<ProductImage, ResponseProductImageDto>();
        }
    }
}
