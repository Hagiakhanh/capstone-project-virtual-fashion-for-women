using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.StatusLog
{
    public class RequestCreateStatusLog
    {
        public int OrderId { get; set; }
        public string Status {  get; set; }
        public DateTime UpdateAt { get; set; }
    }
}
