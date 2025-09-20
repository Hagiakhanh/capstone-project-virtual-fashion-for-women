using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class ResponseGetProductInSaleCampaign
    {
        public string ProductId { get; set; }

        public decimal? PercentDiscount { get; set; }

        public decimal? SalePrice { get; set; }

        public virtual ResponseProductDto Product { get; set; }
        public int CampaignId { get; set; }
        public ResponseGetShortSaleCampaignDetail CampaignDetail { get; set; }

    }
}
