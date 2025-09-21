using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.DTO.Order;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IPaymentService
{
    public Task<string> CreatePaymentUrlInMomoAsync(Order order);
    public Task<string> HandleMomoCallback(MomoReturnModel momoReturnModel);
    public Task<string> CreatePaymentUrlInVnPayAsync(Order order);

    //Dùng để tạo payment cho đơn hàng khi khách thanh toán
    public Task<string> CreatePaymentAsync(RequestCreateOrder requestCreateOrder);
}