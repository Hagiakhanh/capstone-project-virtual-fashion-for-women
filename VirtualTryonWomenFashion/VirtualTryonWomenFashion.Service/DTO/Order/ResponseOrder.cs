using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;
using VirtualTryonWomenFashion.Service.DTO.Transaction;
using VirtualTryonWomenFashion.Service.DTO.User;

namespace VirtualTryonWomenFashion.Service.DTO.Order;

public class ResponseOrder
{
    public int OrderId { get; set; }
    public string ReceiverName { get; set; }
    public string ReceiverPhone { get; set; }
    public string ReceiverAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public decimal? Amount { get; set; }
    public string Note { get; set; }
    public decimal? ShippingMoney { get; set; }
    public decimal? InsuranceFee { get; set; }
    public string? PaymentUrl { get; set; }
    public string? ShippingCode { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
    public List<TransactionInformation> TransactionInformations { get; set; }
    public UserInformation UserInformation { get; set; }
    public List<ResponseOrderDetail> ResponseOrderDetails { get; set; }
    public List<ResponseStatusLog> ResponseStatusLogs { get; set; }
}