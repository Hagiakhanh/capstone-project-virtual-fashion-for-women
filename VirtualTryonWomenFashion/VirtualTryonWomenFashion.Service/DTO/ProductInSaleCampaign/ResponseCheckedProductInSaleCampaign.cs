using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class ResponseCheckedProductInSaleCampaign
    {
        public List<string> ValidProductIDList { get; set; } = new List<string>();
        public List<string> InvalidProductIDList { get; set; } = new List<string>();
    }
}
