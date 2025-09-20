using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class RequestCheckingProductInSaleCampaign
    {
        public DateOnly startDate { get; set; }
        public DateOnly endDate { get; set; }
        public List<string> listProductID { get; set; }
    }
}
