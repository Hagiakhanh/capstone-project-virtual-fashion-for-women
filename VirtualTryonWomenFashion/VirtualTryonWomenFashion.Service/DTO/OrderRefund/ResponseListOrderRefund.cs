using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.OrderRefund
{
    public class ResponseListOrderRefund
    {
        public int OrderRefundId { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Address { get; set; }
        public List<ItemRefund> itemRefunds { get; set; }

    }

    public class ItemRefund
    {
        public string ProductVarientName { get; set; }
        public string? ProductVarientImage { get; set; }
    }

}
