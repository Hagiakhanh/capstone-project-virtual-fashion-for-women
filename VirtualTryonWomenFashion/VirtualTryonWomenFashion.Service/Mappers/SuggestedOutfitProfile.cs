using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.SuggestedOutfit;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public class SuggestedOutfitProfile : Profile
    {
        public SuggestedOutfitProfile()
        {
            CreateMap<SuggestedOutfit, ResponseSuggestedOutfitModel>();
        }
    }
}
