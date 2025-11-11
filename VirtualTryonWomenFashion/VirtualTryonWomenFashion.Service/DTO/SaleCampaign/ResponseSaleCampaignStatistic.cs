using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.SaleCampaign
{
    public class ResponseSaleCampaignStatistic
    {
        public decimal TotalRevenue { get; set; }
        public int TotalSoldQuantity { get; set; }
        public decimal AverageRevenuePerDate { get; set; }
        public List<ResponseProductInSaleCampaignStatistic> ListProductInCampaign { get; set; }
        public List<ResponseSaleCampaignRevenueDate> ListSaleRevenueDate { get; set; }
    }
    public class ResponseSaleCampaignRevenueDate
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
    }
    public class ResponseProductInSaleCampaignStatistic
    {
        public int TotalSoldQuantity { get; set; }
        public string ProductID { get; set; }
        public string ProductName { get; set; }
        public string ImageUrl { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<ResponseVariantInSaleCampaignStatistic> ListResponseProductVariant { get; set; }
    }

    public class ResponseVariantInSaleCampaignStatistic
    {
        public string ProductVariantId { get; set; }
        public string ProductVariantName { get; set; }
        public int SoldQuantity { get; set; }
        public string ImageUrl { get; set; }
    }
}
