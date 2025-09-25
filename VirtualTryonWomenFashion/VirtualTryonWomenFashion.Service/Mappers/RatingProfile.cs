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
            CreateMap<Rating, ResponseRatingDto>();
        }
    }
}
