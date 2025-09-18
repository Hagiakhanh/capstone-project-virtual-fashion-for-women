using System.Text.Json.Serialization;

namespace VirtualTryonWomenFashion.Service.Utils;

public class ShippingObjectRequest
{

    [JsonPropertyName("service_id")] 
    public int ServiceId { get; set; } = 0;

    [JsonPropertyName("service_type_id")] 
    public int ServiceTypeId { get; set; } = 2;

    [JsonPropertyName("to_ward_code")]
    public string ToWardCode { get; set; }

    [JsonPropertyName("to_district_id")]
    public int ToDistrictId { get; set; }

    [JsonPropertyName("weight")]
    public decimal Weight { get; set; }

    [JsonPropertyName("length")]
    public decimal Length { get; set; }

    [JsonPropertyName("width")]
    public decimal Width { get; set; }

    [JsonPropertyName("height")]
    public decimal Height { get; set; }

    [JsonPropertyName("insurance_value")]
    public decimal InsuranceValue { get; set; }

    [JsonPropertyName("cod_failed_amount")]
    public decimal CodFailedAmount { get; set; } = 0;

    [JsonPropertyName("coupon")]
    public string? Coupon { get; set; }
}