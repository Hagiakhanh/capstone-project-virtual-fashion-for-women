using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.OrderRefund
{
    public class ResponseOrderRefundDetail
    {
        public int OrderRefundId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OrderRefundStatus { get; set; }
        public int ProductCount { get; set; }
        public string CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string ReceiverName { get; set; }
        public string ReceiverAddress { get; set; }
        public string ReceiverPhone { get; set; }
        public decimal Amount { get; set; }
        public string? TransactionStatus { get; set; }
        public DateTime? TransactionTime { get; set; }
        public List<OrderRefundDetailItem> Items { get; set; }

    }
    public class OrderRefundDetailItem
    {
        public string VariantName { get; set; }
        public string? VariantImage { get; set; }
        public string VariantColor { get; set; }
        public string VariantSize { get; set; }
        public decimal VariantPrice { get; set; }
        public int Quantity { get; set; }
        public decimal VariantAmount { get; set; }
    }

}
