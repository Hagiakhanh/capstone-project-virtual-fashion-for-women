using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.SaleCampaign
{
    public class RequestUpdateSaleCampaign
    {
        public string CampaignName { get; set; }

        public string DescriptionUpdated { get; set; }
        public IFormFile? ImageFile { get; set; }

        public List<RequestCreateProductInSaleCampaign>? ProductInSalesCampaigns { get; set; }
        public List<string>? ListIdDeleted { get; set; }
        public SaleCampaignStatusEnum? CampaignStatus { get; set; }
    }
}
