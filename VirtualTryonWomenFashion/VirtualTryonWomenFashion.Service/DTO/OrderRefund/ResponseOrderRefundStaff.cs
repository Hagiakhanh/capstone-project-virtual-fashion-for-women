using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.OrderRefund
{
    public class ResponseOrderRefundStaff
    {
        public int OrderRefundId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ReceiverName { get; set; }
        public string ReceiverPhone { get; set; }
        public string Email { get; set; }
        public string? Reason { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
    }
}
