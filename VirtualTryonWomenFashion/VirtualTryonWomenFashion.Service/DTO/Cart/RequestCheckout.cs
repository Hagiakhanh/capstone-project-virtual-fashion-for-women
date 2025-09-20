using System.ComponentModel.DataAnnotations;

namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class RequestCheckout
{
    public List<string> productVariantIds { get; set; }
    public string ProvinceName { get; set; }
    public string DistrictName { get; set; }
    public string WardName { get; set; }
}