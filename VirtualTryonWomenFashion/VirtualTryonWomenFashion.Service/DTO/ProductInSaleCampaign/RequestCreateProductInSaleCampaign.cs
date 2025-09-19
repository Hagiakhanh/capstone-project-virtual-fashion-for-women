using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class RequestCreateProductInSaleCampaign
    {
        public string ProductID { get; set; }
        public SalePriceTypeInputEnum DiscountType { get; set; }
        public decimal Value { get; set; }

    }
}
