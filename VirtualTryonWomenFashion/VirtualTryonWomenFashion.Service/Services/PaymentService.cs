using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Hubs;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class PaymentService : IPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly ITransactionService _transactionService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IOrderService _orderService;
    private readonly IOrderDetailService _orderDetailService;
    private readonly IProductVariantService _productVariantService;
    private readonly ICartService _cartService;
    private readonly INotificationService _notificationService;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly IUserService _userService;
    private readonly IWalletService _walletService;

    public PaymentService(
        IConfiguration configuration,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ITransactionService transactionService,
        IOrderService orderService,
        IOrderDetailService orderDetailService,
        IProductVariantService productVariantService,
        ICartService cartService,
        INotificationService notificationService,
        IHubContext<NotificationHub> notificationHub,
        IUserService userService,
        IWalletService walletService
    )
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _transactionService = transactionService;
        _orderService = orderService;
        _orderDetailService = orderDetailService;
        _productVariantService = productVariantService;
        _cartService = cartService;
        _notificationService = notificationService;
        _notificationHub = notificationHub;
        _userService = userService;
        _walletService = walletService;
    }

    public async Task<string> CreatePaymentUrlInMomoAsync(Order order)
    {
        try
        {
            int userId = _currentUserService.GetUserId();
            decimal totalAmount = (decimal)(order.Amount);
            if (totalAmount < 1000 || totalAmount > 50000000)
            {
                throw new Exception("Số tiền thanh toán phải từ 1.000 VNĐ đến 50.000.000 VNĐ");
            }

            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = totalAmount,
                Method = PaymentMethodEnum.Momo.ToString(),
                Type = TypeTransactionEnum.Purchase.ToString(),
                CreatedAt = DateTime.UtcNow.AddHours(7),
                UpdatedAt = DateTime.UtcNow.AddHours(7),
                OrderId = order.OrderId
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
            string orderInfo = $"Khách hàng {userId} thanh toán đơn hàng giá trị {totalAmount} VNĐ";

            transaction.ThirdPartyCode = requestId;
            transaction.ThirdPartyOrderIdCode = orderId;
            string rawSignature =
                $"accessKey={accessKey}" +
                $"&amount={totalAmount}" +
                $"&extraData={extraData}" +
                $"&ipnUrl={ipnUrl}" +
                $"&orderId={orderId}" +
                $"&orderInfo={orderInfo}" +
                $"&partnerCode={partnerCode}" +
                $"&redirectUrl={redirectUrl}" +
                $"&requestId={requestId}" +
                $"&requestType={requestType}";

            await Console.Out.WriteLineAsync("Đây là IPN của momo: " + ipnUrl);
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
                    amount = totalAmount,
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
                    await _transactionService.CreateTransactionAsync(transaction);
                    return paymentUrl;
                }
                else
                {
                    throw new Exception("Thất bại khi lấy url thanh toán từ momo.");
                }
            }

            throw new Exception("Thất bại khi tạo ra signature key.");
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi tạo url thanh toán từ momo: {ex.Message}");
        }
    }

    public async Task<int> QueryTransactionStatusInMomoAsync(Transaction transaction)
    {
        try
        {
            string partnerCode = _configuration["MomoPayment:PartnerCode"];
            string accessKey = _configuration["MomoPayment:AccessKey"];
            string secretKey = _configuration["MomoPayment:SecretKey"];
            string requestId = transaction.ThirdPartyCode;
            string orderId = transaction.ThirdPartyOrderIdCode;

            string rawSignature =
                $"accessKey={accessKey}" +
                $"&orderId={orderId}" +
                $"&partnerCode={partnerCode}" +
                $"&requestId={requestId}";
            string signature = ComputeHmacSha256(rawSignature, secretKey);

            if (!string.IsNullOrEmpty(signature))
            {
                var requestData = new
                {
                    partnerCode = partnerCode,
                    requestId = requestId,
                    orderId = orderId,
                    signature = signature,
                    lang = "vi",
                };

                var jsonRequestData = JsonConvert.SerializeObject(requestData);

                using var client = new HttpClient();
                var content = new StringContent(jsonRequestData, Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://test-payment.momo.vn/v2/gateway/api/query", content);

                var responseContent = await response.Content.ReadAsStringAsync();
                using JsonDocument doc = JsonDocument.Parse(responseContent);
                int resultCode = doc.RootElement.GetProperty("resultCode").GetInt32();

                return resultCode;
            }
            else
            {
                throw new Exception("Thất bại khi tạo ra signature key trong query transaction tới momo.");
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi truy vấn trạng thái giao dịch từ momo: {ex.Message}");
        }
    }

    public async Task<string> HandleMomoCallback(MomoReturnModel momoReturnModel)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Xử lý callback từ Momo
            // Kiểm tra chữ ký để xác thực tính hợp lệ của dữ liệu

            string secretKey = _configuration["MomoPayment:SecretKey"];
            string accessKey = _configuration["MomoPayment:AccessKey"];
            string rawSignature =
                $"accessKey={accessKey}" +
                $"&amount={momoReturnModel.amount}" +
                $"&extraData={momoReturnModel.extraData}" +
                $"&message={momoReturnModel.message}" +
                $"&orderId={momoReturnModel.orderId}" +
                $"&orderInfo={momoReturnModel.orderInfo}" +
                $"&orderType={momoReturnModel.orderType}" +
                $"&partnerCode={momoReturnModel.partnerCode}" +
                $"&payType={momoReturnModel.payType}" +
                $"&requestId={momoReturnModel.requestId}" +
                $"&responseTime={momoReturnModel.responseTime}" +
                $"&resultCode={momoReturnModel.resultCode}" +
                $"&transId={momoReturnModel.transId}";

            string computedSignature = ComputeHmacSha256(rawSignature, secretKey);

            if (computedSignature != momoReturnModel.signature)
            {
                throw new Exception("Chữ ký không hợp lệ.");
            }

            var transaction = await _transactionService.GetTransactionByThirdPartyIdAsync(momoReturnModel.requestId);


            // Cập nhật trạng thái giao dịch và đơn hàng dựa trên resultCode
            // resultCode = 0 nghĩa là thanh toán thành công
            if (momoReturnModel.resultCode == 0)
            {
                transaction.Status = TransactionStatusEnum.Success.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionService.UpdateTransactionStatusAsync(new List<Transaction>() { transaction });
                if (transaction.Type == TypeTransactionEnum.Purchase.ToString())
                {
                    ResponseOrder responseOrder =
                        await _orderService.GetOrderByIdAsync(transaction.OrderId.Value, transaction.UserId);
                    if (responseOrder == null)
                    {
                        throw new Exception("Đơn hàng không tồn tại.");
                    }

                    await _orderService.UpdatePaymentUrlAsync(null, responseOrder.OrderId);
                    // Xóa các item trong giỏ hàng tương ứng với đơn hàng đã thanh toán
                    List<ResponseOrderDetail> listResponseOrderDetail =
                        await _orderDetailService.GetOrderDetailsByOrderIdAsync(responseOrder.OrderId);

                    List<string> productVariantIds = listResponseOrderDetail
                        .Where(od => od.ResponseProductVariantDto != null) // tránh null
                        .Select(od => od.ResponseProductVariantDto.ProductVariantId)
                        .ToList();

                    await _cartService.RemoveMultipleProductsFromCartAsync(productVariantIds, transaction.UserId);
                    // Cập nhật trạng thái đơn hàng thành "Confirmed"
                    await _orderService.UpdateOrderStatusAsync(OrderStatusEnum.Confirmed.ToString(),
                        responseOrder.OrderId);
                    RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                    {
                        ReceiverId = transaction.UserId,
                        Title = "Đặt hàng thành công",
                        Content = "Đơn hàng của bạn đã được đặt thành công và đang chờ shop đóng gói."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotification);
                    await _notificationHub.Clients.Group(transaction.UserId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotification.Title);
                    List<User> staffUsers = await _userService.GetAllStaff();
                    if (staffUsers.Count > 0)
                    {
                        List<RequestCreateNotification> requestCreateNotificationStaff =
                            new List<RequestCreateNotification>();
                        foreach (var staff in staffUsers)
                        {
                            RequestCreateNotification requestNotificationStaff = new RequestCreateNotification()
                            {
                                ReceiverId = staff.UserId,
                                Title = "Có đơn vừa mới tạo",
                                Content = "Vừa có đơn hàng mới được đặt trong hệ thống"
                            };
                            requestCreateNotificationStaff.Add(requestNotificationStaff);
                        }

                        await _notificationService.CreateListNotificationAsync(requestCreateNotificationStaff);
                        await _notificationHub.Clients.Group("StaffGroup")
                            .SendAsync("ReceiveNotification", requestCreateNotificationStaff.First().Title);
                    }
                }
                else if (transaction.Type == TypeTransactionEnum.Recharge.ToString())
                {
                    await _walletService.UpdateBalanceInWalletAsync(new RequestUpdateRecharge()
                    {
                        WalletId = transaction.WalletId.Value,
                        Amount = transaction?.Money ?? 0
                    }, TypeTransactionEnum.Recharge.ToString());

                    // Gửi thông báo nạp tiền thành công
                    RequestCreateNotification requestCreateNotificationRecharge = new RequestCreateNotification()
                    {
                        ReceiverId = transaction.UserId,
                        Title = "Nạp tiền vào ví thành công",
                        Content = $"Bạn đã nạp thành công {transaction.Money} VNĐ vào ví."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotificationRecharge);
                    await _notificationHub.Clients.Group(transaction.UserId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotificationRecharge.Title);
                }
            }
            else
            {
                transaction.Status = TransactionStatusEnum.Failed.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionService.UpdateTransactionStatusAsync(new List<Transaction>() { transaction });

                ResponseOrder responseOrder =
                    await _orderService.GetOrderByIdAsync(transaction.OrderId.Value, transaction.UserId);
                if (responseOrder == null)
                {
                    throw new Exception("Đơn hàng không tồn tại.");
                }

                // Cập nhật trạng thái đơn hàng thành "Failed"
                await _orderService.UpdateOrderStatusAsync(OrderStatusEnum.Failed.ToString(), responseOrder.OrderId);
                await _orderService.UpdatePaymentUrlAsync(null, responseOrder.OrderId);
                // Trả lại số lượng sản phẩm về kho 
                List<ResponseOrderDetail> listResponseOrderDetail =
                    await _orderDetailService.GetOrderDetailsByOrderIdAsync(responseOrder.OrderId);

                List<string> productVariantIds = listResponseOrderDetail
                    .Where(od => od.ResponseProductVariantDto != null) // tránh null
                    .Select(od => od.ResponseProductVariantDto.ProductVariantId)
                    .ToList();

                await _cartService.ShowCartItemsAsync(productVariantIds, transaction.UserId);
                foreach (var item in listResponseOrderDetail)
                {
                    await _productVariantService.UpdateAsync(item.ResponseProductVariantDto.ProductVariantId,
                        new UpdateProductVariantRequest()
                        {
                            Quantity = item.ResponseProductVariantDto.Quantity + item.Quantity
                        }, true);
                }
            }

            await _unitOfWork.CommitTransactionAsync();
            await Console.Out.WriteLineAsync("Xử lý IPN của momo thành công");
            return "Xử lý callback thành công";
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            Console.WriteLine($"Lỗi xử lý callback từ Momo: {ex.Message}");
            throw;
        }
    }

    public async Task<string> HandleVnPayCallback(IQueryCollection request)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in request)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            var vnp_SecureHash = request.FirstOrDefault(p => p.Key == "vnp_SecureHash").Value;
            bool isSignatureValid = vnpay.ValidateSignature(vnp_SecureHash, _configuration["VnPayPayment:HashSecret"]);
            if (!isSignatureValid)
            {
                throw new Exception("Chữ ký không hợp lệ.");
            }

            var transaction =
                await _transactionService.GetTransactionByThirdPartyIdAsync((vnpay.GetResponseData("vnp_TxnRef")));

            if (vnpay.GetResponseData("vnp_ResponseCode") == "00")
            {
                transaction.Status = TransactionStatusEnum.Success.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionService.UpdateTransactionStatusAsync(new List<Transaction>() { transaction });

                if (transaction.Type == TypeTransactionEnum.Purchase.ToString())
                {
                    ResponseOrder responseOrder =
                        await _orderService.GetOrderByIdAsync(transaction.OrderId.Value, transaction.UserId);
                    if (responseOrder == null)
                    {
                        throw new Exception("Đơn hàng không tồn tại.");
                    }

                    await _orderService.UpdatePaymentUrlAsync(null, responseOrder.OrderId);
                    // Xóa các item trong giỏ hàng tương ứng với đơn hàng đã thanh toán
                    List<ResponseOrderDetail> listResponseOrderDetail =
                        await _orderDetailService.GetOrderDetailsByOrderIdAsync(responseOrder.OrderId);

                    List<string> productVariantIds = listResponseOrderDetail
                        .Where(od => od.ResponseProductVariantDto != null) // tránh null
                        .Select(od => od.ResponseProductVariantDto.ProductVariantId)
                        .ToList();

                    await _cartService.RemoveMultipleProductsFromCartAsync(productVariantIds, transaction.UserId);
                    // Cập nhật trạng thái đơn hàng thành "Confirmed"
                    await _orderService.UpdateOrderStatusAsync(OrderStatusEnum.Confirmed.ToString(),
                        responseOrder.OrderId);

                    RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                    {
                        ReceiverId = transaction.UserId,
                        Title = "Đặt hàng thành công",
                        Content = "Đơn hàng của bạn đã được đặt thành công và đang chờ shop đóng gói."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotification);
                    await _notificationHub.Clients.Group(transaction.UserId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotification.Title);
                }
                else if (transaction.Type == TypeTransactionEnum.Recharge.ToString())
                {
                    await _walletService.UpdateBalanceInWalletAsync(new RequestUpdateRecharge()
                    {
                        WalletId = transaction.WalletId.Value,
                        Amount = transaction?.Money ?? 0
                    },TypeTransactionEnum.Recharge.ToString());

                    // Gửi thông báo nạp tiền thành công
                    RequestCreateNotification requestCreateNotificationRecharge = new RequestCreateNotification()
                    {
                        ReceiverId = transaction.UserId,
                        Title = "Nạp tiền vào ví thành công",
                        Content = $"Bạn đã nạp thành công {transaction.Money} VNĐ vào ví."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotificationRecharge);
                    await _notificationHub.Clients.Group(transaction.UserId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotificationRecharge.Title);
                }
            }
            else
            {
                transaction.Status = TransactionStatusEnum.Failed.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionService.UpdateTransactionStatusAsync(new List<Transaction>() { transaction });

                ResponseOrder responseOrder =
                    await _orderService.GetOrderByIdAsync(transaction.OrderId.Value, transaction.UserId);
                if (responseOrder == null)
                {
                    throw new Exception("Đơn hàng không tồn tại.");
                }

                // Cập nhật trạng thái đơn hàng thành "Failed"
                await _orderService.UpdateOrderStatusAsync(OrderStatusEnum.Failed.ToString(), responseOrder.OrderId);
                await _orderService.UpdatePaymentUrlAsync(null, responseOrder.OrderId);
                // Trả lại số lượng sản phẩm về kho 
                List<ResponseOrderDetail> listResponseOrderDetail =
                    await _orderDetailService.GetOrderDetailsByOrderIdAsync(responseOrder.OrderId);

                List<string> productVariantIds = listResponseOrderDetail
                    .Where(od => od.ResponseProductVariantDto != null) // tránh null
                    .Select(od => od.ResponseProductVariantDto.ProductVariantId)
                    .ToList();

                await _cartService.ShowCartItemsAsync(productVariantIds, transaction.UserId);
                foreach (var item in listResponseOrderDetail)
                {
                    await _productVariantService.UpdateAsync(item.ResponseProductVariantDto.ProductVariantId,
                        new UpdateProductVariantRequest()
                        {
                            Quantity = item.ResponseProductVariantDto.Quantity + item.Quantity
                        }, true);
                }
            }

            await _unitOfWork.CommitTransactionAsync();
            await Console.Out.WriteLineAsync("Xử lý IPN của vnpay thành công");
            return "Xử lý callback thành công";
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            Console.WriteLine($"Lỗi xử lý callback từ VnPay: {ex.Message}");
            throw;
        }
    }

    public async Task<string> QueryTransactionStatusInVnPayAsync(Transaction transaction)
    {
        try
        {
            string secretKey = _configuration["VnPayPayment:HashSecret"];
            string requestId = Guid.NewGuid().ToString();
            string version = _configuration["VnPayPayment:Version"];
            string command = "querydr";
            string tmnCode = _configuration["VnPayPayment:TmnCode"];
            string txnRef = transaction.ThirdPartyCode;
            string orderInfo = $"Truy vấn trạng thái giao dịch {txnRef} từ VnPay";
            string transactionDate = transaction.CreatedAt.ToString("yyyyMMddHHmmss");
            string createDate = DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss");

            HttpContext context = new HttpContextAccessor().HttpContext;
            var ipAddress = VnPayUtils.GetIpAddress(context);

            var rawData = requestId + "|" +
                          version + "|" +
                          command + "|" +
                          tmnCode + "|" +
                          txnRef + "|" +
                          transactionDate + "|" +
                          createDate + "|" +
                          ipAddress + "|" +
                          orderInfo;
            var checksum = VnPayUtils.HmacSHA512(secretKey, rawData);

            var requestData = new Dictionary<string, string>
            {
                { "vnp_RequestId", requestId },
                { "vnp_Version", version },
                { "vnp_Command", command },
                { "vnp_TmnCode", tmnCode },
                { "vnp_TxnRef", txnRef },
                { "vnp_OrderInfo", orderInfo },
                { "vnp_TransactionDate", transactionDate },
                { "vnp_CreateDate", createDate },
                { "vnp_IpAddr", ipAddress },
                { "vnp_SecureHash", checksum }
            };

            var jsonRequestData = JsonConvert.SerializeObject(requestData);

            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;

            using var client = new HttpClient(handler);
            var content = new StringContent(jsonRequestData, Encoding.UTF8, "application/json");
            var response =
                await client.PostAsync("https://sandbox.vnpayment.vn/merchant_webapi/api/transaction", content);

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;
            string responseCode = root.GetProperty("vnp_ResponseCode").GetString();
            if (responseCode == "00")
                return root.GetProperty("vnp_TransactionStatus").GetString();
            else
                throw new Exception($"Lỗi từ VnPay với message lỗi: {root.GetProperty("vnp_Message").GetString()}");
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi truy vấn trạng thái giao dịch từ VnPay: {ex.Message}");
        }
    }

    public async Task<bool> PaymentByWalletAsync(RequestCreateOrder requestCreateOrder)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            int userId = _currentUserService.GetUserId();
            Order order = await _orderService.CreateOrderAsync(requestCreateOrder);
            ResponseWallet userWallet = await _walletService.GetWalletAsync(userId);
            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = order.Amount,
                Method = PaymentMethodEnum.Wallet.ToString(),
                Type = TypeTransactionEnum.Purchase.ToString(),
                CreatedAt = DateTime.UtcNow.AddHours(7),
                UpdatedAt = DateTime.UtcNow.AddHours(7),
                OrderId = order.OrderId,
                WalletId = userWallet.WalletId,
                ThirdPartyCode = Guid.NewGuid().ToString()
            };
            int resultUpdateBalance = await _walletService.UpdateBalanceInWalletAsync(
                new RequestUpdateRecharge()
                {
                    WalletId = userWallet.WalletId,
                    Amount = (decimal)order.Amount
                }, TypeTransactionEnum.Purchase.ToString()
                );
            if( resultUpdateBalance > 0)
            {
                transaction.Status = TransactionStatusEnum.Success.ToString();
                await _transactionService.CreateTransactionAsync(transaction);
                await _orderService.UpdateOrderStatusAsync(OrderStatusEnum.Confirmed.ToString(),order.OrderId);
            }
            await _unitOfWork.CommitTransactionAsync();
            return true;
        }catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception($"Lỗi khi thanh toán bằng ví: {ex.Message}");
        }
       
        
                
        throw new NotImplementedException();
    }

    public async Task<string> CreatePaymentAsync(RequestCreateOrder requestCreateOrder)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            Order order = await _orderService.CreateOrderAsync(requestCreateOrder);
            string paymentUrl = "";
            if (PaymentMethodEnum.Momo.ToString() == requestCreateOrder.PaymentMethod)
            {
                paymentUrl = await this.CreatePaymentUrlInMomoAsync(order);
            }
            else if (PaymentMethodEnum.VnPay.ToString() == requestCreateOrder.PaymentMethod)
            {
                paymentUrl = await this.CreatePaymentUrlInVnPayAsync(order);
            }
            else
            {
                throw new Exception("Unsupported payment method");
            }

            if (!string.IsNullOrEmpty(paymentUrl)) await _orderService.UpdatePaymentUrlAsync(paymentUrl, order.OrderId);
            await _unitOfWork.CommitTransactionAsync();
            return paymentUrl;
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception($"Error creating payment: {ex.Message}");
        }
    }

    public async Task HandleOrderStatusAndTransactionStatus()
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            List<Order> pendingOrders = await _orderService.GetOrdersByStatusAsync(OrderStatusEnum.Pending.ToString());
            List<Transaction> pendingTransactions = new List<Transaction>();
            List<Order> failedOrders = new List<Order>();
            List<Order> successfulOrders = new List<Order>();
            foreach (var item in pendingOrders)
            {
                var transaction = await _transactionService.GetTransactionByOrderIdAsync(item.OrderId);
                switch (transaction.Method)
                {
                    case "Momo":
                        int resultCodeFromMomo = await this.QueryTransactionStatusInMomoAsync(transaction);
                        switch (resultCodeFromMomo)
                        {
                            case 0:
                                transaction.Status = TransactionStatusEnum.Success.ToString();
                                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                pendingTransactions.Add(transaction);
                                successfulOrders.Add(item);
                                break;
                            case 1006:
                            case 1005:
                                transaction.Status = TransactionStatusEnum.Failed.ToString();
                                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                pendingTransactions.Add(transaction);
                                failedOrders.Add(item);
                                break;
                        }

                        break;
                    case "VnPay":
                        string resultCodeFromVnPay = await this.QueryTransactionStatusInVnPayAsync(transaction);
                        switch (resultCodeFromVnPay)
                        {
                            case "00":
                                transaction.Status = TransactionStatusEnum.Success.ToString();
                                pendingTransactions.Add(transaction);
                                successfulOrders.Add(item);
                                break;
                            case "11":
                            case "08":
                                transaction.Status = TransactionStatusEnum.Failed.ToString();
                                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                pendingTransactions.Add(transaction);
                                failedOrders.Add(item);
                                break;
                        }

                        break;
                }
            }

            if (pendingTransactions.Count > 0)
            {
                await _transactionService.UpdateTransactionStatusAsync(pendingTransactions);
                await _orderService.HandleSuccessfulOrders(successfulOrders);
                await _orderService.HandleFailedOrders(failedOrders);
            }

            await _unitOfWork.CommitTransactionAsync();
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception($"Lỗi khi xử lý trạng thái đơn hàng và giao dịch: {ex.Message}");
        }
    }

    public async Task HandleRechargeTransactionStatus()
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            List<Transaction> pendingTransactions = await _transactionService.GetAllPendingRechargeTransaction();
            List<RequestUpdateRecharge> successfulTransaction = new List<RequestUpdateRecharge>();
            foreach (var item in pendingTransactions)
            {
                switch (item.Method)
                {
                    case "Momo":
                        int resultCodeFromMomo = await this.QueryTransactionStatusInMomoAsync(item);
                        switch (resultCodeFromMomo)
                        {
                            case 0:
                                item.Status = TransactionStatusEnum.Success.ToString();
                                item.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                successfulTransaction.Add(new RequestUpdateRecharge()
                                {
                                    WalletId = item.WalletId.Value,
                                    Amount = item.Money ?? 0
                                });
                                break;
                            case 1006:
                            case 1005:
                            case 99:
                                item.Status = TransactionStatusEnum.Failed.ToString();
                                item.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                break;
                        }

                        break;
                    case "VnPay":
                        string resultCodeFromVnPay = await this.QueryTransactionStatusInVnPayAsync(item);
                        switch (resultCodeFromVnPay)
                        {
                            case "00":
                                item.Status = TransactionStatusEnum.Success.ToString();
                                successfulTransaction.Add(new RequestUpdateRecharge()
                                {
                                    WalletId = item.WalletId.Value,
                                    Amount = item.Money ?? 0
                                });
                                break;
                            case "11":
                            case "08":
                                item.Status = TransactionStatusEnum.Failed.ToString();
                                item.UpdatedAt = DateTime.UtcNow.AddHours(7);
                                break;
                        }

                        break;
                }
            }

            if (pendingTransactions.Count > 0)
            {
                await _transactionService.UpdateTransactionStatusAsync(pendingTransactions);
                if(successfulTransaction.Count > 0)
                {
                    successfulTransaction = successfulTransaction
                   .GroupBy(x => x.WalletId)
                   .Select(g => new RequestUpdateRecharge
                   {
                       WalletId = g.Key,
                       Amount = g.Sum(x => x.Amount)
                   })
                   .ToList();
                    await _walletService.HandleSuccesfulRecharge(successfulTransaction);
                }
            }

            await _unitOfWork.CommitTransactionAsync();
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception($"Lỗi khi xử lý trạng thái đơn hàng và giao dịch: {ex.Message}");
        }
    }

    public async Task<string> CreatePaymentUrlInVnPayAsync(Order order)
    {
        try
        {
            int userId = _currentUserService.GetUserId();
            decimal totalAmount = (decimal)(order.Amount);
            if (totalAmount < 5000 || totalAmount > 1000000000)
            {
                throw new Exception("Số tiền thanh toán phải nằm trong khoảng 5.000 (VND) đến 1.000.000.000 (VND).");
            }

            DateTime dateTime = DateTime.UtcNow.AddHours(7);
            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = totalAmount,
                Method = PaymentMethodEnum.VnPay.ToString(),
                Type = TypeTransactionEnum.Purchase.ToString(),
                CreatedAt = dateTime,
                UpdatedAt = DateTime.UtcNow.AddHours(7),
                OrderId = order.OrderId
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

            HttpContext context = new HttpContextAccessor().HttpContext;
            var ipAddress = VnPayUtils.GetIpAddress(context);
            var vnPayLibrary = new VnPayLibrary();

            string orderInfo = $"Khach hang {userId} thanh toan don hang gia tri {totalAmount} VND";
            string thirdPartyCode = Guid.NewGuid().ToString();

            //Thêm dữ liệu vào request VNpay
            vnPayLibrary.AddRequestData("vnp_Version", version);
            vnPayLibrary.AddRequestData("vnp_Command", command);
            vnPayLibrary.AddRequestData("vnp_TmnCode", tmnCode);
            vnPayLibrary.AddRequestData("vnp_Amount", ((int)(totalAmount * 100)).ToString());
            vnPayLibrary.AddRequestData("vnp_BankCode", vnpayBank);
            vnPayLibrary.AddRequestData("vnp_CreateDate", dateTime.ToString("yyyyMMddHHmmss"));
            vnPayLibrary.AddRequestData("vnp_CurrCode", currCode);
            vnPayLibrary.AddRequestData("vnp_IpAddr", ipAddress);
            vnPayLibrary.AddRequestData("vnp_Locale", locale);
            vnPayLibrary.AddRequestData("vnp_OrderInfo", orderInfo);
            vnPayLibrary.AddRequestData("vnp_OrderType", "topup");
            vnPayLibrary.AddRequestData("vnp_TxnRef", thirdPartyCode);
            vnPayLibrary.AddRequestData("vnp_ReturnUrl", returnUrl);
            vnPayLibrary.AddRequestData("vnp_ExpireDate", dateTime.AddMinutes(10).ToString("yyyyMMddHHmmss"));

            transaction.ThirdPartyCode = thirdPartyCode;

            // Tạo URL thanh toán
            string paymentUrl = vnPayLibrary.CreateRequestUrl(baseUrl, hashSecret);

            if (string.IsNullOrEmpty(paymentUrl))
            {
                throw new Exception("Không thể tạo URL thanh toán VNPay.");
            }

            // Trả về URL thanh toán
            await _transactionService.CreateTransactionAsync(transaction);
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

    public async Task<string> CreatePaymentUrlInMomoForRechargeAsync(RequestRechargeWallet requestRechargeWallet)
    {
        try
        {
            int userId = _currentUserService.GetUserId();
            if (requestRechargeWallet.Amount < 1000 || requestRechargeWallet.Amount > 50000000)
            {
                throw new Exception("Số tiền thanh toán phải từ 1.000 VNĐ đến 50.000.000 VNĐ");
            }

            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = requestRechargeWallet.Amount,
                Method = "Momo",
                Type = TypeTransactionEnum.Recharge.ToString(),
                CreatedAt = DateTime.UtcNow.AddHours(7),
                UpdatedAt = DateTime.UtcNow.AddHours(7),
                WalletId = requestRechargeWallet.WalletId,
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
            string orderInfo =
                $"Khách hàng {userId} thanh toán nạp tiền cho ví với giá trị {requestRechargeWallet.Amount} VNĐ";

            transaction.ThirdPartyCode = requestId;
            transaction.ThirdPartyOrderIdCode = orderId;
            string rawSignature =
                $"accessKey={accessKey}" +
                $"&amount={requestRechargeWallet.Amount}" +
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
                    amount = requestRechargeWallet.Amount,
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
                    await _transactionService.CreateTransactionAsync(transaction);
                    return paymentUrl;
                }
                else
                {
                    throw new Exception("Thất bại khi lấy url thanh toán từ momo cho nạp tiền.");
                }
            }

            throw new Exception("Thất bại khi tạo ra signature key.");
        }
        catch (Exception ex)
        {
            throw new Exception($"Lỗi khi tạo url thanh toán từ momo cho nạp tiền: {ex.Message}");
        }
    }

    public async Task<string> CreatePaymentUrlInVnPayForRechargeAsync(RequestRechargeWallet requestRechargeWallet)
    {
        try
        {
            int userId = _currentUserService.GetUserId();
            decimal totalAmount = (decimal)(requestRechargeWallet.Amount);
            if (totalAmount < 5000 || totalAmount > 1000000000)
            {
                throw new Exception("Số tiền thanh toán phải nằm trong khoảng 5.000 (VND) đến 1.000.000.000 (VND).");
            }

            DateTime dateTime = DateTime.UtcNow.AddHours(7);
            Transaction transaction = new Transaction()
            {
                UserId = userId,
                Status = TransactionStatusEnum.Pending.ToString(),
                Money = requestRechargeWallet.Amount,
                Method = PaymentMethodEnum.VnPay.ToString(),
                Type = TypeTransactionEnum.Recharge.ToString(),
                CreatedAt = DateTime.UtcNow.AddHours(7),
                UpdatedAt = DateTime.UtcNow.AddHours(7),
                WalletId = requestRechargeWallet.WalletId,
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

            HttpContext context = new HttpContextAccessor().HttpContext;
            var ipAddress = VnPayUtils.GetIpAddress(context);
            var vnPayLibrary = new VnPayLibrary();

            string orderInfo = $"Khach hang {userId} thanh toan nap tien voi gia tri {totalAmount} VND";
            string thirdPartyCode = Guid.NewGuid().ToString();

            //Thêm dữ liệu vào request VNpay
            vnPayLibrary.AddRequestData("vnp_Version", version);
            vnPayLibrary.AddRequestData("vnp_Command", command);
            vnPayLibrary.AddRequestData("vnp_TmnCode", tmnCode);
            vnPayLibrary.AddRequestData("vnp_Amount", ((int)(totalAmount * 100)).ToString());
            vnPayLibrary.AddRequestData("vnp_BankCode", vnpayBank);
            vnPayLibrary.AddRequestData("vnp_CreateDate", dateTime.ToString("yyyyMMddHHmmss"));
            vnPayLibrary.AddRequestData("vnp_CurrCode", currCode);
            vnPayLibrary.AddRequestData("vnp_IpAddr", ipAddress);
            vnPayLibrary.AddRequestData("vnp_Locale", locale);
            vnPayLibrary.AddRequestData("vnp_OrderInfo", orderInfo);
            vnPayLibrary.AddRequestData("vnp_OrderType", "topup");
            vnPayLibrary.AddRequestData("vnp_TxnRef", thirdPartyCode);
            vnPayLibrary.AddRequestData("vnp_ReturnUrl", returnUrl);
            vnPayLibrary.AddRequestData("vnp_ExpireDate", dateTime.AddMinutes(10).ToString("yyyyMMddHHmmss"));

            transaction.ThirdPartyCode = thirdPartyCode;

            // Tạo URL thanh toán
            string paymentUrl = vnPayLibrary.CreateRequestUrl(baseUrl, hashSecret);

            if (string.IsNullOrEmpty(paymentUrl))
            {
                throw new Exception("Không thể tạo URL thanh toán VNPay cho nạp tiền.");
            }

            // Trả về URL thanh toán
            await _transactionService.CreateTransactionAsync(transaction);
            return paymentUrl;
        }
        catch (Exception ex)
        {
            throw new Exception($"Không thể tạo URL thanh toán VNPay cho nạp tiềnL: {ex.Message}");
        }
    }

    public async Task<string> CreateLinkPaymentForRehargeAsync(RequestRechargeWallet requestRechargeWallet)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            string paymentUrl = "";
            if (PaymentMethodEnum.Momo.ToString() == requestRechargeWallet.PaymentMethod)
            {
                paymentUrl = await this.CreatePaymentUrlInMomoForRechargeAsync(requestRechargeWallet);
            }
            else if (PaymentMethodEnum.VnPay.ToString() == requestRechargeWallet.PaymentMethod)
            {
                paymentUrl = await this.CreatePaymentUrlInVnPayForRechargeAsync(requestRechargeWallet);
            }
            else
            {
                throw new Exception("Các phương toán khác không hỗ trợ");
            }

            // if (!string.IsNullOrEmpty(paymentUrl)) await _orderService.UpdatePaymentUrlAsync(paymentUrl, order.OrderId);
            await _unitOfWork.CommitTransactionAsync();
            return paymentUrl;
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw new Exception(ex.Message);
        }
    }
}