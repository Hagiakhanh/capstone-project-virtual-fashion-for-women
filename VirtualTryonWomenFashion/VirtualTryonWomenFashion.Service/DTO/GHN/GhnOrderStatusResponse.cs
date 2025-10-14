using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.GHN
{
    public class GhnOrderStatusResponse
    {
        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("data")]
        public OrderDataStatusOnly Data { get; set; }
    }

    public class OrderDataStatusOnly
    {
        [JsonPropertyName("status")]
        public string Status { get; set; }
        [JsonPropertyName("order_code")]
        public string OrderCode { get; set; }
    }
}
