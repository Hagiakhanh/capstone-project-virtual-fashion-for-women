using VirtualTryonWomenFashion.Service.DTO.Momo;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IPaymentService
{
    public Task<string> CreatePaymentUrlInMomoAsync(decimal amount);
    public Task<string> HandleMomoCallback(MomoReturnModel momoReturnModel);
    public Task<string> CreatePaymentUrlInVnPayAsync(decimal amount);
}