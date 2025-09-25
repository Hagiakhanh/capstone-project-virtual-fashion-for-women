using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.GHN
{
    public class GhnCreateOrderRequest
    {
        [JsonPropertyName("payment_type_id")]
        public int PaymentTypeId { get; set; }

        [JsonPropertyName("note")]
        public string Note { get; set; }

        [JsonPropertyName("required_note")]
        public string RequiredNote { get; set; }

        [JsonPropertyName("from_name")]
        public string FromName { get; set; }

        [JsonPropertyName("from_phone")]
        public string FromPhone { get; set; }

        [JsonPropertyName("from_address")]
        public string FromAddress { get; set; }

        [JsonPropertyName("from_ward_name")]
        public string FromWardName { get; set; }

        [JsonPropertyName("from_district_name")]
        public string FromDistrictName { get; set; }

        [JsonPropertyName("from_province_name")]
        public string FromProvinceName { get; set; }

        [JsonPropertyName("return_phone")]
        public string ReturnPhone { get; set; }

        [JsonPropertyName("return_address")]
        public string ReturnAddress { get; set; }

        [JsonPropertyName("return_district_id")]
        public int ReturnDistrictId { get; set; }

        [JsonPropertyName("return_ward_code")]
        public string ReturnWardCode { get; set; }

        [JsonPropertyName("client_order_code")]
        public string ClientOrderCode { get; set; }

        [JsonPropertyName("to_name")]
        public string ToName { get; set; }

        [JsonPropertyName("to_phone")]
        public string ToPhone { get; set; }

        [JsonPropertyName("to_address")]
        public string ToAddress { get; set; }

        [JsonPropertyName("to_ward_code")]
        public string ToWardCode { get; set; }

        [JsonPropertyName("to_district_id")]
        public int ToDistrictId { get; set; }

        [JsonPropertyName("cod_amount")]
        public decimal CodAmount { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }

        [JsonPropertyName("weight")]
        public int Weight { get; set; }

        [JsonPropertyName("length")]
        public int Length { get; set; }

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("pick_station_id")]
        public int PickStationId { get; set; }

        [JsonPropertyName("deliver_station_id")]
        public int? DeliverStationId { get; set; }

        [JsonPropertyName("insurance_value")]
        public decimal InsuranceValue { get; set; }

        [JsonPropertyName("service_id")]
        public int ServiceId { get; set; }

        [JsonPropertyName("service_type_id")]
        public int ServiceTypeId { get; set; }

        [JsonPropertyName("coupon")]
        public string Coupon { get; set; }

        [JsonPropertyName("pick_shift")]
        public List<int> PickShift { get; set; }
    }
}
