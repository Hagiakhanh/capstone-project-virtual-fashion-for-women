using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IPaymentService
{
    public Task<string> CreatePaymentUrlInMomoAsync(Order order);
    public Task<int> QueryTransactionStatusInMomoAsync(Transaction transaction);
    public Task<string> HandleMomoCallback(MomoReturnModel momoReturnModel);
    public Task<string> CreatePaymentUrlInVnPayAsync(Order order);
    public Task<string> HandleVnPayCallback(IQueryCollection request);
    public Task<string> QueryTransactionStatusInVnPayAsync(Transaction transaction);
    
    public Task<bool> PaymentByWalletAsync(RequestCreateOrder requestCreateOrder);

    //Dùng để tạo payment cho đơn hàng khi khách thanh toán
    public Task<string> CreatePaymentAsync(RequestCreateOrder requestCreateOrder);
    public Task HandleOrderStatusAndTransactionStatus();
    public Task HandleRechargeTransactionStatus();
    public Task<string> CreateLinkPaymentForRehargeAsync(RequestRechargeWallet requestRechargeWallet);
    public Task<string> CreatePaymentUrlInMomoForRechargeAsync(RequestRechargeWallet requestRechargeWallet);
    public Task<string> CreatePaymentUrlInVnPayForRechargeAsync(RequestRechargeWallet requestRechargeWallet);
    public Task HandleTransactionStatusWithMomoMethod();
    public Task<bool> CreateWithDrawTransaction(RequestWithDraw requestWithDraw);
    public Task<List<BankResponse>> GetBanks();

}