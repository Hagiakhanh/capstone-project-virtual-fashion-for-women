using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.SaleCampaign
{
    public class RequestCreateSaleCampaign
    {
        [Required]
        public string CampaignName { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public IFormFile ImageFile { get; set; }
        [Required]
        public DateOnly StartDate { get; set; }
        [Required]
        public DateOnly EndDate { get; set; }
        [Required]
        public List<RequestCreateProductInSaleCampaign> ProductInSalesCampaigns { get; set; }
    }
}
