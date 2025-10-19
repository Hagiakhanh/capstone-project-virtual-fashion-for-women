using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Service.DTO.Order
{
    public class ResponseOrderDetailForStaff
    {
        public int OrderId { get; set; }

        public int CustomerId { get; set; }

        public string ReceiverName { get; set; }

        public string ReceiverPhone { get; set; }

        public string ReceiverAddress { get; set; }

        public DateTime CreatedAt { get; set; }

        public string Status { get; set; }

        public decimal? Amount { get; set; }

        public string Note { get; set; }

        public decimal? PackageWeight { get; set; }

        public decimal? PackageHeight { get; set; }

        public decimal? PackageWidth { get; set; }

        public decimal? PackageLength { get; set; }

        public decimal? ShippingMoney { get; set; }

        public string? ShippingCode { get; set; }

        public DateTime? EstimatedDelivery { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string PaymentStatus { get; set; }
        public decimal? TotalWithShippingMoney { get; set; }
        public int TotalQuantity { get; set; }

        public List<OrderDetailInformation> OrderDetails { get; set; }
    }

    public class OrderDetailInformation
    {
        public int OrderDetailID { get; set; }
        public int Quantity { get; set; }
        public string ProductName { get; set; }
        public string ImageUrl { get; set; }
        public string? Size { get; set; }
        public string? ColorName { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }

    }
}
