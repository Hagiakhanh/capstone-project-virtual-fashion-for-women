using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.GHN
{
    public class GhnOrderStatusRequest
    {
        [JsonPropertyName("order_code")]
        public string OrderCode { get; set; }
    }
}
