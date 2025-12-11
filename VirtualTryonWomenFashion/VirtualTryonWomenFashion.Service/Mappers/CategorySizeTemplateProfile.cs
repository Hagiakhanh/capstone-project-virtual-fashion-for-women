using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Category;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public class CategorySizeTemplateProfile : Profile
    {
        public CategorySizeTemplateProfile() {
            CreateMap<CategorySizeTemplate, CategoryTemplateSizeResponse>()
                .ForMember(dest => dest.SizeCode, opt => opt.MapFrom(src => src.Size.SizeCode))
                .ForMember(dest => dest.BodyPart, opt => opt.MapFrom(src => src.Category.BodyPart));
        }
    }
}
