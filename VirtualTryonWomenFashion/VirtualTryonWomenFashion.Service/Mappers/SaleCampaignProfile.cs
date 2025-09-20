using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public class SaleCampaignProfile : Profile
    {
        public SaleCampaignProfile()
        {
            CreateMap<SaleCampaign, ResponseGetSaleCampaign>();
            CreateMap<SaleCampaign, ResponseGetShortSaleCampaignDetail>();
        }
    }
}
