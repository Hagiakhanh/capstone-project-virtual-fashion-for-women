using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.OrderRefund
{
    public class RequestCreateOrderRefund
    {
        [Required(ErrorMessage = "OrderID is required")]
        public int OrderID { get; set; }

        [Required(ErrorMessage = "Customer reason is required")]
        public string CustomerReason { get; set; }

        [Required(ErrorMessage = "ImageUrl is required")]
        public IFormFile[] ImageUrl { get; set; }

        public List<RequestRefundItem>? Items { get; set; }
    }

    public class RequestRefundItem
    {
        [Required(ErrorMessage = "OrderDetailID is required")]
        public int OrderDetailID { get; set; }

    }

}
