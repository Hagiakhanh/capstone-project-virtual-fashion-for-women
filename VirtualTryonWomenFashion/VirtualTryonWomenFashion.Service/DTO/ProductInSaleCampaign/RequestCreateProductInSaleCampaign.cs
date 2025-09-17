using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class RequestCreateProductInSaleCampaign
    {
        public string ProductVariantId { get; set; }

        public decimal? PercentDiscount { get; set; }

        public decimal? SalePrice { get; set; }

    }
}
