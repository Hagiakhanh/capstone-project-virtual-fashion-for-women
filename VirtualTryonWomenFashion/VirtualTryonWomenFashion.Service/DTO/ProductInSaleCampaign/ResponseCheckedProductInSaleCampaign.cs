using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign
{
    public class ResponseCheckedProductInSaleCampaign
    {
        public List<string> ValidProductIDList = new List<string>();
        public List<string> InvalidProductIDList = new List<string>();
    }
}
