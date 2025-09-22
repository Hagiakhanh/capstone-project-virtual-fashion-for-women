using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Order
{
    public class ResponseOrderForStaff
    {
        public int OrderID { get; set; }
        public string ReceiverName { get; set; }
        public string ReceiverPhone { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
    }
}
