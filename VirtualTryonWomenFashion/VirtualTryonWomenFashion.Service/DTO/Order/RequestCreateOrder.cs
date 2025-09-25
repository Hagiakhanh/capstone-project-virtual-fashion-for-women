using System.ComponentModel.DataAnnotations;

namespace VirtualTryonWomenFashion.Service.DTO.Order;

public class RequestCreateOrder
{
    [Required]
    public List<int> cartIds { get; set; }
    [Required]
    public string RecieverName { get; set; }
    [Phone]
    [StringLength(10, MinimumLength = 9)]
    [Required]
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