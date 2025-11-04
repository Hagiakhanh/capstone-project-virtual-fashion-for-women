using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Rating;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public class RatingProfile : Profile
    { 
        public RatingProfile() 
        { 
            CreateMap<Rating, ResponseRatingDto>().ForMember(dest => dest.UserName,
                    opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
                .ForMember(dest => dest.ProductVariantName,
                    opt => opt.MapFrom(src => src.OrderDetail != null && src.OrderDetail.ProductVariant != null
                        ? src.OrderDetail.ProductVariant.VariantName
                        : null));;
        }
    }
}
