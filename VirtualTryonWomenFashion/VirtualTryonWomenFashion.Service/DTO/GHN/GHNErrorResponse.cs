using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.GHN
{
    public class GHNErrorResponse
    {
        public int code { get; set; }
        public string message { get; set; }
        public object data { get; set; }
        public string code_message { get; set; }
        public string code_message_value { get; set; }
    }
}
