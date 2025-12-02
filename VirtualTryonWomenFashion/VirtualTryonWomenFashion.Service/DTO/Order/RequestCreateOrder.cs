using System.ComponentModel.DataAnnotations;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.DTO.Order;

public class RequestCreateOrder
{
    [Required]
    public List<int> cartIds { get; set; }
    [Required]
    public string RecieverName { get; set; }
    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Số điện thoại phải có đúng 10 chữ số.")]
    [PhoneVN]
    public string RecieverPhone { get; set; }
    [Required]
    public string FullAddress { get; set; }
    [Required]
    public string ProvinceName { get; set; }
    [Required]
    public string DistrictName { get; set; }
    [Required]
    public string WardName { get; set; }
    public string? Note { get; set; } = "";
    [Required]
    public string PaymentMethod { get; set; }
    
}