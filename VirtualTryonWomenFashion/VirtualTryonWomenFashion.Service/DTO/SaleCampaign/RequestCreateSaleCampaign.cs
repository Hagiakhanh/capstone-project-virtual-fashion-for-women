using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.SaleCampaign
{
    public class RequestCreateSaleCampaign
    {
        public string CampaignName { get; set; }

        public string Description { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        List<RequestCreateProductInSaleCampaign> ProductInSalesCampaigns { get; set; }
    }
}
