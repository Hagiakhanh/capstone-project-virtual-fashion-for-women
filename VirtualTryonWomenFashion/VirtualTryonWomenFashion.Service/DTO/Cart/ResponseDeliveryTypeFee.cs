using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Cart
{
    public class ResponseDeliveryTypeFee
    {
        public string DeliveryType { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal InsuranceFee { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Error { get; set; }
    }
}
