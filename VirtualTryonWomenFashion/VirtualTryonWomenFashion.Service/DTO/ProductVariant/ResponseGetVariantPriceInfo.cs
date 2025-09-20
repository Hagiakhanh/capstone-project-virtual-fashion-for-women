using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.ProductVariant
{

    public class ResponseGetVariantPriceInfo
    {
        public string ProductVariantId { get; set; }
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? CurrentPrice { get; set; } // Giá cuối cùng (sau khi giảm hoặc giá gốc nếu không có campaign)
        public bool HasActiveCampaign { get; set; }
        public ResponseGetProductInSaleCampaign SaleCampaignInfo { get; set; }
    }
}
