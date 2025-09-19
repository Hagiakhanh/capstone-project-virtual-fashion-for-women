using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.SaleCampaign
{
    public class ResponseGetSaleCampaign
    {
        public int CampaignId { get; set; }

        public string CampaignName { get; set; }

        public string Description { get; set; }

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public string Status { get; set; }
        public string ImageUrl { get; set; }
    }
}
