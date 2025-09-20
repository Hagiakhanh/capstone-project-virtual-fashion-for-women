using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public PaymentService(
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService
    )
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<string> CreatePaymentUrlInMomoAsync(decimal amount)
    {
        try
        {
            int userId = _currentUserService.GetUserId();

            if (amount < 1000 || amount > 50000000)
            {
                throw new Exception("Số tiền thanh toán phải từ 1.000 VNĐ đến 50.000.000 VNĐ");
            }
            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = amount,
                Method = "Momo",
                CreatedAt = DateTime.UtcNow.AddHours(7),
            };

            string endpoint = _configuration["MomoPayment:BaseUrl"];
            string partnerCode = _configuration["MomoPayment:PartnerCode"];
            string accessKey = _configuration["MomoPayment:AccessKey"];
            string secretKey = _configuration["MomoPayment:SecretKey"];
            string redirectUrl = _configuration["MomoPayment:ReturnUrl"];
            string ipnUrl = _configuration["MomoPayment:NotifyUrl"];
            string requestType = _configuration["MomoPayment:RequestType"];
            string extraData = "";

            string orderId = Guid.NewGuid().ToString();
            string requestId = Guid.NewGuid().ToString();
            string orderInfo = $"Khách hàng {userId} thanh toán đơn hàng giá trị {amount} VNĐ";

            transaction.ThirdPartyCode = requestId;
            string rawSignature =
                $"accessKey={accessKey}" +
                $"&amount={amount}" +
                $"&extraData={extraData}" +
                $"&ipnUrl={ipnUrl}" +
                $"&orderId={orderId}" +
                $"&orderInfo={orderInfo}" +
                $"&partnerCode={partnerCode}" +
                $"&redirectUrl={redirectUrl}" +
                $"&requestId={requestId}" +
                $"&requestType={requestType}";


            string signature = ComputeHmacSha256(rawSignature, secretKey);

            if (!string.IsNullOrEmpty(signature))
            {
                var requestData = new
                {
                    partnerCode = partnerCode,
                    requestType = requestType,
                    ipnUrl = ipnUrl,
                    redirectUrl = redirectUrl,
                    orderId = orderId,
                    amount = amount,
                    orderInfo = orderInfo,
                    requestId = requestId,
                    extraData = extraData,
                    signature = signature,
                    lang = "vi",
                    /*partnerName = "Test",
                    storeId = "MomoTestStore",*/
                };

                var jsonRequestData = JsonConvert.SerializeObject(requestData);

                using var client = new HttpClient();
                var content = new StringContent(jsonRequestData, Encoding.UTF8, "application/json");
                var response = await client.PostAsync(endpoint, content);

                var responseContent = await response.Content.ReadAsStringAsync();
                dynamic jsonResponse = JsonConvert.DeserializeObject(responseContent);

                string paymentUrl = jsonResponse?.payUrl;

                if (!string.IsNullOrEmpty(paymentUrl))
                {
                    return paymentUrl;
                }
                else
                {
                    throw new Exception("Failed to get payment URL from Momo.");
                }
            }

            throw new Exception("Failed to create signature key.");
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating momo payment URL: {ex.Message}");
        }
    }

    public Task<string> HandleMomoCallback(MomoReturnModel momoReturnModel)
    {
        throw new NotImplementedException();
    }

    public async Task<string> CreatePaymentUrlInVnPayAsync(decimal amount)
    {
        try
        {
            int userId = _currentUserService.GetUserId();
            if (amount < 5000 || amount > 1000000000)
            {
                throw new Exception("Số tiền thanh toán phải nằm trong khoảng 5.000 (VND) đến 1.000.000.000 (VND).");
            }
            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = amount,
                Method = "VnPay",
                CreatedAt = DateTime.UtcNow.AddHours(7),
            };

            string version = _configuration["VnPayPayment:Version"];
            string command = _configuration["VnPayPayment:Command"];
            string tmnCode = _configuration["VnPayPayment:TmnCode"];
            string currCode = _configuration["VnPayPayment:CurrCode"];
            string vnpayBank = _configuration["VnPayPayment:BankCode"];
            string locale = _configuration["VnPayPayment:Locale"];
            string returnUrl = _configuration["VnPayPayment:ReturnUrl"];
            string baseUrl = _configuration["VnPayPayment:BaseUrl"];
            string hashSecret = _configuration["VnPayPayment:HashSecret"];

            DateTime dateTime = DateTime.UtcNow.AddHours(7);
            HttpContext context = new HttpContextAccessor().HttpContext;
            var ipAddress = VnPayUtils.GetIpAddress(context);
            var vnPayLibrary = new VnPayLibrary();

            string orderInfo = $"Khach hang {userId} thanh toan don hang gia tri {amount} VND";
            string thirdPartyCode = Guid.NewGuid().ToString();

            //Thêm dữ liệu vào request VNpay
            vnPayLibrary.AddRequestData("vnp_Version", version);
            vnPayLibrary.AddRequestData("vnp_Command", command);
            vnPayLibrary.AddRequestData("vnp_TmnCode", tmnCode);
            vnPayLibrary.AddRequestData("vnp_Amount", ((int)(amount * 100)).ToString());
            vnPayLibrary.AddRequestData("vnp_BankCode", vnpayBank);
            vnPayLibrary.AddRequestData("vnp_CreateDate", dateTime.ToString("yyyyMMddHHmmss"));
            vnPayLibrary.AddRequestData("vnp_CurrCode", currCode);
            vnPayLibrary.AddRequestData("vnp_IpAddr", ipAddress);
            vnPayLibrary.AddRequestData("vnp_Locale", locale);
            vnPayLibrary.AddRequestData("vnp_OrderInfo", orderInfo);
            vnPayLibrary.AddRequestData("vnp_OrderType", "topup");
            vnPayLibrary.AddRequestData("vnp_TxnRef", thirdPartyCode);
            vnPayLibrary.AddRequestData("vnp_ReturnUrl", returnUrl);

            transaction.ThirdPartyCode = thirdPartyCode;

            // Tạo URL thanh toán
            string paymentUrl = vnPayLibrary.CreateRequestUrl(baseUrl, hashSecret);

            if (string.IsNullOrEmpty(paymentUrl))
            {
                throw new Exception("Không thể tạo URL thanh toán VNPay.");
            }

            // Trả về URL thanh toán
            return paymentUrl;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error creating vnpay payment URL: {ex.Message}");
        }
    }

    private string ComputeHmacSha256(string message, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        byte[] hashBytes;

        using (var hmac = new HMACSHA256(keyBytes))
        {
            hashBytes = hmac.ComputeHash(messageBytes);
        }

        var hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        return hashString;
    }
}