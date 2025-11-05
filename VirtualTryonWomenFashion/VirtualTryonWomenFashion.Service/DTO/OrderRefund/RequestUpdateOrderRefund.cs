using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Service.DTO.OrderRefund
{
    public class RequestUpdateOrderRefund
    {
        [Required(ErrorMessage = "OrderRefundId require")]
        public int OrderRefundId { get; set; }

        [Required(ErrorMessage = "StatusEnum require")]
        public OrderRefundStatusEnum StatusEnum { get; set; }

        [Required(ErrorMessage = "StaffResponse require")]
        public string StaffResponse { get; set; }
    }
}
