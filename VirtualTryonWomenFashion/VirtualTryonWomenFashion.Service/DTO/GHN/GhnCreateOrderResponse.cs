using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.GHN
{
    public class GhnCreateOrderResponse
    {
        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("code_message_value")]
        public string CodeMessageValue { get; set; }

        [JsonPropertyName("data")]
        public GhnOrderData Data { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("message_display")]
        public string MessageDisplay { get; set; }
    }
    public class GhnOrderData
    {
        [JsonPropertyName("order_code")]
        public string OrderCode { get; set; }

        [JsonPropertyName("sort_code")]
        public string SortCode { get; set; }

        [JsonPropertyName("trans_type")]
        public string TransType { get; set; }

        [JsonPropertyName("ward_encode")]
        public string WardEncode { get; set; }

        [JsonPropertyName("district_encode")]
        public string DistrictEncode { get; set; }

        [JsonPropertyName("fee")]
        public GhnFee Fee { get; set; }

        [JsonPropertyName("total_fee")]
        public int TotalFee { get; set; }

        [JsonPropertyName("expected_delivery_time")]
        public DateTime ExpectedDeliveryTime { get; set; }

        [JsonPropertyName("operation_partner")]
        public string OperationPartner { get; set; }
    }
    public class GhnFee
    {
        [JsonPropertyName("main_service")]
        public int MainService { get; set; }

        [JsonPropertyName("insurance")]
        public int Insurance { get; set; }

        [JsonPropertyName("cod_fee")]
        public int CodFee { get; set; }

        [JsonPropertyName("station_do")]
        public int StationDo { get; set; }

        [JsonPropertyName("station_pu")]
        public int StationPu { get; set; }

        [JsonPropertyName("return")]
        public int Return { get; set; }

        [JsonPropertyName("r2s")]
        public int R2s { get; set; }

        [JsonPropertyName("return_again")]
        public int ReturnAgain { get; set; }

        [JsonPropertyName("coupon")]
        public int Coupon { get; set; }

        [JsonPropertyName("document_return")]
        public int DocumentReturn { get; set; }

        [JsonPropertyName("double_check")]
        public int DoubleCheck { get; set; }

        [JsonPropertyName("double_check_deliver")]
        public int DoubleCheckDeliver { get; set; }

        [JsonPropertyName("pick_remote_areas_fee")]
        public int PickRemoteAreasFee { get; set; }

        [JsonPropertyName("deliver_remote_areas_fee")]
        public int DeliverRemoteAreasFee { get; set; }

        [JsonPropertyName("pick_remote_areas_fee_return")]
        public int PickRemoteAreasFeeReturn { get; set; }

        [JsonPropertyName("deliver_remote_areas_fee_return")]
        public int DeliverRemoteAreasFeeReturn { get; set; }

        [JsonPropertyName("cod_failed_fee")]
        public int CodFailedFee { get; set; }
    }
}
