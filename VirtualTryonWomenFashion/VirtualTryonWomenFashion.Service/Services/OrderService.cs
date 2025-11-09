using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Cart;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.GHN;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;
using VirtualTryonWomenFashion.Service.Utils;
using Newtonsoft.Json.Serialization;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;
using VirtualTryonWomenFashion.Service.Hubs;
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.DTO.Wallet;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderDetailService _orderDetailService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICartService _cartService;
        private readonly IProductVariantService _productVariantService;
        private readonly GHNSettings _ghnSettings;
        private readonly HttpClient _client;
        private readonly IUserInteractionService _userInteractionService;
        private readonly IProductService _productService;
        private readonly IStatusLogService _statusLogService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly IUserService _userService;
        private readonly IOrderRefundRepository _orderRefundRepository;
        private readonly IWalletService _walletService;
        private readonly ITransactionService _transactionService;

        public OrderService(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            IOrderDetailService orderDetailService,
            ICurrentUserService currentUserService,
            ICartService cartService,
            IProductVariantService productVariantService,
            IOptions<GHNSettings> ghnSettings,
            HttpClient client,
            IUserInteractionService userInteractionService,
            IProductService productService,
            IStatusLogService statusLogService,
            INotificationService notificationService,
            IHubContext<NotificationHub> notificationHub,
            IUserService userService,
            IOrderRefundRepository orderRefundRepository,
            IWalletService walletService,
            ITransactionService transactionService
        )
        {
            _orderDetailService = orderDetailService;
            _currentUserService = currentUserService;
            _cartService = cartService;
            _productVariantService = productVariantService;
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _ghnSettings = ghnSettings.Value;
            _client = client;
            _userInteractionService = userInteractionService;
            _productService = productService;
            _statusLogService = statusLogService;
            _notificationService = notificationService;
            _notificationHub = notificationHub;
            _userService = userService;
            _orderRefundRepository = orderRefundRepository;
            _walletService = walletService;
            _transactionService = transactionService;
        }

        public async Task<Order> CreateOrderAsync(RequestCreateOrder requestCreateOrder)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                var cartItems = await _cartService.GetSelectedCartItemsAsync(requestCreateOrder.cartIds);

                int totalWeight = (int)Math.Ceiling(cartItems.Sum(item =>
                    item.ResponseProductVariantDto.ProductWeight * item.QuantityItem) ?? 0);
                int totalHeight = (int)Math.Ceiling(cartItems.Sum(item =>
                    item.ResponseProductVariantDto.ProductHeight * item.QuantityItem) ?? 0);
                int totalWidth = (int)Math.Ceiling(cartItems.Max(c => c.ResponseProductVariantDto.ProductWidth) ?? 0);
                int totalLength = (int)Math.Ceiling(cartItems.Max(c => c.ResponseProductVariantDto.ProductLength) ?? 0);

                ResponseCheckout responseCheckout = await _cartService.CheckoutAsync(new RequestCheckout()
                {
                    cartIds = requestCreateOrder.cartIds,
                    ProvinceName = requestCreateOrder.ProvinceName,
                    DistrictName = requestCreateOrder.DistrictName,
                    WardName = requestCreateOrder.WardName,
                });

                (int provinceId, int districtId, string wardCode) =
                    await _cartService.GetAddressCodeAsync(requestCreateOrder.ProvinceName,
                        requestCreateOrder.DistrictName,
                        requestCreateOrder.WardName);
                Order order = new Order()
                {
                    CustomerId = userId,
                    ReceiverName = requestCreateOrder.RecieverName,
                    ReceiverPhone = requestCreateOrder.RecieverPhone,
                    ReceiverAddress = requestCreateOrder.FullAddress,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    Note = requestCreateOrder.Note,
                    Status = OrderStatusEnum.Pending.ToString(),
                    Amount = responseCheckout.TotalPrice,
                    PackageWeight = totalWeight,
                    PackageHeight = totalHeight,
                    PackageWidth = totalWidth,
                    PackageLength = totalLength,
                    ShippingMoney = responseCheckout.ServiceFee,
                    InsuranceFee = responseCheckout.InsuranceFee,
                    ProvinceId = provinceId,
                    DistrictId = districtId,
                    WardCode = wardCode,
                };
                await _orderRepository.InsertAsync(order);
                await _unitOfWork.SaveChanges();
                List<OrderDetail> orderDetails = new List<OrderDetail>();
                List<string> productVariantIds = new List<string>();
                foreach (var item in cartItems)
                {
                    var responseGetVariantPriceInfo =
                        await _productVariantService.GetVariantPriceInfoAsync(item.ProductVariantId);
                    var productVariant = await _productVariantService.GetProductVariantById(item.ProductVariantId);

                    OrderDetail orderDetail = new OrderDetail()
                    {
                        OrderId = order.OrderId,
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.QuantityItem,
                        PriceAtTime = (decimal)responseGetVariantPriceInfo.CurrentPrice,
                        CampaignId = responseGetVariantPriceInfo.HasActiveCampaign
                            ? responseGetVariantPriceInfo.SaleCampaignInfo.CampaignId
                            : null
                    };
                    int newQuantity = (int)productVariant?.Quantity - item.QuantityItem;
                    if (newQuantity < 0)
                    {
                        throw new Exception("Số lượng sản phẩm trong kho không đủ");
                    }

                    await _productVariantService.UpdateAsync(item.ProductVariantId, new UpdateProductVariantRequest()
                    {
                        Quantity = productVariant?.Quantity - item.QuantityItem
                    }, true);
                    productVariantIds.Add(item.ProductVariantId);
                    orderDetails.Add(orderDetail);
                }


                int result = await _orderDetailService.CreateOrderDetailAsync(orderDetails);
                if (result > 0)
                {
                    if (productVariantIds.Any())
                    {
                        foreach (var productVariantId in productVariantIds)
                        {
                            var product = await _productService.GetProductByVariantIdAsync(productVariantId);
                            await _userInteractionService.CreateAsync(new CreateUpdateUserInteractionDto()
                            {
                                ProductId = product.ProductId,
                                InteractionType = UserInteractionEnum.Purchase.ToString(),
                                Weight = 5.0m
                            });
                        }
                    }

                    await _cartService.HideCartItemsAsync(productVariantIds);
                    await _statusLogService.CreateStatusLog(new List<RequestCreateStatusLog>()
                    {
                        new RequestCreateStatusLog()
                        {
                            OrderId = order.OrderId,
                            Status = OrderStatusEnum.Pending.ToString(),
                            UpdateAt = DateTime.UtcNow.AddHours(7)
                        }
                    });
                    return order;
                }
                else
                {
                    throw new Exception("Create order failed");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred while create order in the cart: {ex.Message}.", ex);
                throw;
            }
        }

        public async Task<ResponseOrder?> GetOrderByIdAsync(int orderId, int? userId = null)
        {
            if (userId == null)
            {
                userId = _currentUserService.GetUserId();
            }

            var order = await _orderRepository.GetOrderByOrderID(orderId);
            if (order == null)
            {
                throw new Exception("Order không tồn tại");
            }

            if (order.CustomerId != userId)
            {
                throw new Exception("Bạn không có quyền xem đơn hàng này");
            }

            var userInformation = order.Customer.MapToUserInformation();
            List<ResponseOrderDetail> responseOrderDetails =
                await _orderDetailService.GetOrderDetailsByOrderIdAsync(orderId);
            ResponseOrder responseOrder = order.MapToResponseOrder(responseOrderDetails);
            return responseOrder;
        }

        public async Task<int> UpdateOrderStatusAsync(string status, int orderId)
        {
            try
            {
                Order order = await _orderRepository.GetByIdAsync(orderId);
                if (order == null)
                {
                    throw new Exception("Order không tồn tại");
                }

                order.Status = status;
                await _orderRepository.UpdateAsync(order);
                await _statusLogService.CreateStatusLog(new List<RequestCreateStatusLog>()
                {
                    new RequestCreateStatusLog()
                    {
                        OrderId = orderId,
                        Status = status,
                        UpdateAt = DateTime.UtcNow.AddHours(7)
                    }
                });
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật trạng thái của order: {ex.Message}");
            }
        }

        public async Task<int> UpdatePaymentUrlAsync(string paymentUrl, int orderId)
        {
            try
            {
                Order order = await _orderRepository.GetByIdAsync(orderId);
                if (order == null)
                {
                    throw new Exception("Order không tồn tại");
                }

                order.PaymentUrl = paymentUrl;
                await _orderRepository.UpdateAsync(order);
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật link thanh toán của order: {ex.Message}");
            }
        }

        public async Task<List<Order>> GetOrdersByStatusAsync(string status)
        {
            var orders = await _orderRepository.GetOrdersByStatus(OrderStatusEnum.Pending.ToString());
            return orders;
        }

        public async Task<Pagination<ResponseOrder>> GetAllOrdersForCustomer(PaginationParameter page,
            string orderStatus)
        {
            int userId = _currentUserService.GetUserId();
            List<Order> rawOrders = await _orderRepository.GetAll(
                filter: o => o.CustomerId == userId && (o.Status == orderStatus || string.IsNullOrEmpty(orderStatus)),
                pagination: page,
                orderBy: o => o.OrderByDescending(x => x.CreatedAt),
                includes:
                new Expression<Func<Order, object>>[]
                {
                    o => o.Customer,
                    o => o.Transaction,
                    o => o.StatusLogs
                }
            );
            int totalRecords = await _orderRepository.CountAsync(o =>
                o.CustomerId == userId && (o.Status == orderStatus || string.IsNullOrEmpty(orderStatus)));
            List<ResponseOrder> responseOrders = new List<ResponseOrder>();
            foreach (Order order in rawOrders)
            {
                List<ResponseOrderDetail> responseOrderDetails =
                    await _orderDetailService.GetOrderDetailsByOrderIdAsync(order.OrderId, userId);
                responseOrders.Add(order.MapToResponseOrder(responseOrderDetails));
            }

            return new Pagination<ResponseOrder>(responseOrders, totalRecords, page.PageIndex, page.PageSize);
        }

        public async Task HandleFailedOrders(List<Order> failedOrders)
        {
            var allOrderDetails =
                await _orderDetailService.GetOrderDetailsByOrderIdsAsync(failedOrders.Select(o => o.OrderId).ToList());

            var variantQuantityAdjustments = new Dictionary<string, int>();

            // Số lượng item trong cart cần được khôi phục
            var cartRestores = new Dictionary<(int userId, string variantId), int>();
            foreach (var detail in allOrderDetails)
            {
                if (!variantQuantityAdjustments.ContainsKey(detail.ProductVariantId))
                    variantQuantityAdjustments[detail.ProductVariantId] = 0;

                variantQuantityAdjustments[detail.ProductVariantId] += detail.Quantity;

                var key = (detail.Order.CustomerId, detail.ProductVariantId);
                if (!cartRestores.ContainsKey(key))
                    cartRestores[key] = 0;
                cartRestores[key] += detail.Quantity;
            }

            // Restore vào Cart
            foreach (var restore in cartRestores)
            {
                await _cartService.RestoreCartItemAsync(
                    restore.Key.userId,
                    restore.Key.variantId,
                    restore.Value
                );
            }

            await _productVariantService.UpdateQuantityAsync(variantQuantityAdjustments);

            List<RequestCreateStatusLog> statusLogs = new List<RequestCreateStatusLog>();
            foreach (var order in failedOrders)
            {
                order.Status = OrderStatusEnum.Failed.ToString();
                order.PaymentUrl = null;
                statusLogs.Add(new RequestCreateStatusLog()
                {
                    OrderId = order.OrderId,
                    Status = OrderStatusEnum.Failed.ToString(),
                    UpdateAt = DateTime.UtcNow.AddHours(7)
                });
            }

            if (failedOrders == null || failedOrders.Count == 0)
                return;
            await _orderRepository.UpdateRangeAsync(failedOrders);
            await _unitOfWork.SaveChanges();
            await _statusLogService.CreateStatusLog(statusLogs);
        }

        public async Task HandleSuccessfulOrders(List<Order> successfulOrders)
        {
            List<RequestCreateStatusLog> statusLogs = new List<RequestCreateStatusLog>();
            foreach (var order in successfulOrders)
            {
                order.Status = OrderStatusEnum.Confirmed.ToString();
                order.PaymentUrl = null;
                statusLogs.Add(new RequestCreateStatusLog()
                {
                    OrderId = order.OrderId,
                    Status = OrderStatusEnum.Confirmed.ToString(),
                    UpdateAt = DateTime.UtcNow.AddHours(7)
                });
            }

            if (successfulOrders == null || successfulOrders.Count == 0)
                return;
            await _orderRepository.UpdateRangeAsync(successfulOrders);
            await _unitOfWork.SaveChanges();
            await _statusLogService.CreateStatusLog(statusLogs);
            List<User> staffUsers = await _userService.GetAllStaff();
            if (staffUsers.Count > 0)
            {
                List<RequestCreateNotification> requestCreateNotificationStaff = new List<RequestCreateNotification>();
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

        public async Task<MessageModelWithData<Pagination<ResponseOrderForStaff>>> GetAllOrderForStaff(
            PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease)
        {
            Expression<Func<Order, bool>> filterExpression =
                x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString();
            int totalCount = await _orderRepository.CountAsync(filterExpression);

            List<Order> listOrder = new();
            if (isDateDecrease)
            {
                // Ngày mới nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    includes: x => x.Customer,
                    orderBy: x => x.OrderByDescending(x => x.CreatedAt)
                );
            }
            else
            {
                // Ngày cũ nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    includes: x => x.Customer,
                    orderBy: x => x.OrderBy(x => x.CreatedAt)
                );
            }

            List<ResponseOrderForStaff> responseOrderForStaff = listOrder.Select(x => new ResponseOrderForStaff
            {
                OrderID = x.OrderId,
                ReceiverName = x.ReceiverName,
                ReceiverPhone = x.ReceiverPhone,
                CreatedAt = x.CreatedAt,
                Status = ((OrderStatusEnum)Enum.Parse(typeof(OrderStatusEnum), x.Status)).ToString(),
                Amount = x.Amount.Value,
                Email = x.Customer.Email
            }
            ).ToList();

            if (responseOrderForStaff.Any())
            {
                return new MessageModelWithData<Pagination<ResponseOrderForStaff>>()
                {
                    Message = "Lấy dữ liệu đơn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = new Pagination<ResponseOrderForStaff>(responseOrderForStaff, totalCount, page.PageIndex,
                        page.PageSize)
                };
            }

            return new MessageModelWithData<Pagination<ResponseOrderForStaff>>
            {
                Message = "Không tìm thấy đơn hàng nào thỏa mãn điều kiện",
                StatusCode = StatusCodes.Status200OK,
                Data = new Pagination<ResponseOrderForStaff>(
                    new List<ResponseOrderForStaff>(),
                    0,
                    page.PageIndex,
                    page.PageSize
                )
            };
        }

        public async Task<MessageModelWithData<ResponseOrderDetailForStaff>> GetOrderDetailForStaff(int orderID)
        {
            Order? order = await _orderRepository.GetOrderByOrderID(orderID);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }

            ResponseOrderDetailForStaff responseData = new ResponseOrderDetailForStaff
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverAddress = order.ReceiverAddress,
                CreatedAt = order.CreatedAt,
                Status = ((OrderStatusEnum)Enum.Parse(typeof(OrderStatusEnum), order.Status)).ToString(),
                Amount = order.Amount - order.ShippingMoney ?? 0,
                Note = order.Note,
                PackageWeight = order.PackageWeight,
                PackageHeight = order.PackageHeight,
                PackageWidth = order.PackageWidth,
                PackageLength = order.PackageLength,
                ShippingMoney = order.ShippingMoney,
                ShippingCode = order.ShippingCode,
                InsuranceFee = order.InsuranceFee,
                EstimatedDelivery = order.EstimatedDelivery,
                OrderDetails = order.OrderDetails.Select(x => new OrderDetailInformation
                {
                    OrderDetailID = x.OrderDetailId,
                    Quantity = x.Quantity,
                    ProductName = x.ProductVariant.ProductColor.Product.ProductName,
                    ImageUrl = x.ProductVariant.ProductColor.Product.MainImageUrl,
                    Size = x.ProductVariant.Size.SizeCode,
                    ColorName = x.ProductVariant.ProductColor.Color.ColorName,
                    Price = x.PriceAtTime,
                    Amount = x.PriceAtTime * x.Quantity
                }).ToList(),
                CustomerName = order.Customer.FullName,
                CustomerPhone = order.Customer.PhoneNumber,
                CustomerEmail = order.Customer.Email,
                PaymentMethod = order.Transaction.Method,
                PaymentDate = order.Transaction.UpdatedAt,
                PaymentStatus = order.Transaction.Status,
                TotalWithShippingMoney = order.Amount,
                TotalQuantity = order.OrderDetails.Sum(x => x.Quantity),
            };

            return new MessageModelWithData<ResponseOrderDetailForStaff>
            {
                Message = "Lấy dữ liệu chi tiết đơn hàng thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = responseData,
            };
        }

        public async Task<MessageModelWithData<string>> UpdateOrderStatusForStaff(int orderID)
        {
            Order? order = await _orderRepository.GetOrderByOrderID(orderID);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }

            if (order.Status != OrderStatusEnum.Confirmed.ToString())
            {
                throw new Exception("Trạng thái cập nhật không hợp lệ.");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                order.Status = OrderStatusEnum.Packed.ToString();

                // Gửi request cho giao hàng nhanh
                /*using (var client = new HttpClient())
                {*/
                //string url = $"{_ghnSettings.GHNBaseUrl}/shiip/public-api/v2/shipping-order/create";
                GhnCreateOrderRequest ghnCreateOrderRequest = new GhnCreateOrderRequest
                {
                    PaymentTypeId = 1, // Người trả phí shop | 1: Seller, 2: Buyer
                    Note = order.Note, // Note của khách hàng cho shipper
                    RequiredNote =
                        "CHOXEMHANGKHONGTHU", // Các phương thức khi nhận hàng | CHOTHUHANG , CHOXEMHANGKHONGTHU , KHONGCHOXEMHANG 
                    FromName = "Tên của cửa hàng", // Tên của bên gửi 
                    //FromPhone = "0868728859",   // Số điện thoại của bên gửi
                    //FromAddress = "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",  // Địa chỉ gửi
                    //FromWardName = "Phường Long Thạnh Mỹ", // Tên phường gửi | Phải theo api của GHN
                    //FromDistrictName = "Thành Phố Thủ Đức", // Tên huyện gửi | Phải theo api của GHN
                    //FromProvinceName = "Hồ Chí Minh", // Tên tỉnh gửi | Phải theo api của GHN
                    //ReturnPhone = "0868728859", // Số điện thoại để trả lại hàng
                    //ReturnAddress = "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",    // Địa chỉ trả hàng
                    //ReturnDistrictId = 3695,    // ID địa chỉ của huyện trả hàng | Phải theo api của GHN
                    //ReturnWardCode = "90752",   // ID địa chỉ của phường trả hàng | Phải theo api của GHN
                    ClientOrderCode = "", // Không thêm trường này
                    ToName = order.ReceiverName, // Tên của khách hàng
                    ToPhone = order.ReceiverPhone, // Số điện thoại của khách hàng
                    ToAddress = order.ReceiverAddress, // Địa chỉ của khách hàng
                    ToWardCode = order.WardCode, // Phường của người nhận hàng | Phải theo api của GHN
                    ToDistrictId = (int)order.DistrictId, // Huyện của người nhận hàng | Phải theo api của GHN
                    CodAmount = 0, // Tiền COD mà shipper phải thu
                    Content = "Cửa hàng thời trang nữ", // Có thể đặt tên sản phẩm ở đây
                    Weight = (int)order.PackageWeight.Value, // Cân nặng đơn
                    Length = (int)order.PackageLength.Value, // Chiều dài đơn
                    Width = (int)order.PackageWidth.Value, // Chiều rộng đơn
                    Height = (int)order.PackageHeight.Value, // Chiều cao đơn
                    PickStationId = 1444, // Chưa rõ
                    //DeliverStationId = null,    // Chưa rõ
                    InsuranceValue = (int)order.Amount.Value, // Giá trị đơn hàng
                    ServiceId = 0, // Chưa rõ
                    ServiceTypeId = 2, // Loại dịch vụ giao | 2: E-commerce Delivery
                    //Coupon = null,  // Mã phiếu giảm giá
                    PickShift = new List<int> { 3 } // Ca lấy hàng | 3: (7h00 - 12h00)
                };

                /*client.BaseAddress = new Uri(_ghnSettings.GHNBaseUrl);
                client.DefaultRequestHeaders.Add("Token", _ghnSettings.Token);
                client.DefaultRequestHeaders.Add("ShopId", _ghnSettings.ShopId.ToString());*/

                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // bỏ qua field null
                    PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase // GHN dùng snake_case -> mình map lại bằng [JsonPropertyName]
                };
                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(ghnCreateOrderRequest, options),
                    Encoding.UTF8,
                    "application/json");
                var response = await _client.PostAsync("shiip/public-api/v2/shipping-order/create", jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    var resultGHN = await response.Content.ReadAsStringAsync();
                    GhnCreateOrderResponse resultGHNObj = JsonSerializer.Deserialize<GhnCreateOrderResponse>(resultGHN);
                    // ... xử lý result
                    order.ShippingCode = resultGHNObj.Data.OrderCode;
                    order.EstimatedDelivery = resultGHNObj.Data.ExpectedDeliveryTime;
                    await _orderRepository.UpdateAsync(order);
                    int result = await _unitOfWork.SaveChanges();
                    await _statusLogService.CreateStatusLog(new List<RequestCreateStatusLog>()
                    {
                        new RequestCreateStatusLog()
                        {
                            OrderId = order.OrderId,
                            Status = order.Status,
                            UpdateAt = DateTime.UtcNow.AddHours(7)
                        }
                    });
                    RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                    {
                        Title = $"Đơn hàng {order.OrderId} đã được shop đóng gói và chờ shipper lấy hàng",
                        Content = $"Đơn hàng {order.OrderId} của bạn đã được đóng gói thành công. Vui lòng chờ shipper giao đến",
                        ReceiverId = order.CustomerId

                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotification);
                    await _notificationHub.Clients.Group(order.CustomerId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotification.Title);
                    await _unitOfWork.CommitTransactionAsync();
                    if (result > 0)
                    {
                        return new MessageModelWithData<string>
                        {
                            Message = "Cập nhật trạng thái và tạo đơn vận chuyển thành công",
                            StatusCode = StatusCodes.Status200OK,
                            Data = $"{resultGHNObj.Data.OrderCode}"
                        };
                    }
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Không thể tạo đơn hàng vận chuyển. Lỗi GHN: {error}");
                }

                //}

                return new MessageModelWithData<string>
                {
                    Message = "Cập nhật trạng thái thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<MessageModelWithData<GhnOrderSyncResponse>> UpdateOrderStatusInGHNByCode(int orderId)
        {
            Order order = await _orderRepository.GetOrderByOrderID(orderId);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }

            if (order.Status != OrderStatusEnum.Packed.ToString() &&
                order.Status != OrderStatusEnum.Delivering.ToString())
            {
                throw new Exception($"Trạng thái hiện tại của đơn hàng là {order.Status}. Không thể cập nhật GHN");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                /*using (var client = new HttpClient())
                {*/
                List<RequestCreateStatusLog> requestCreateStatusLogs = new List<RequestCreateStatusLog>();
                RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                {
                    ReceiverId = order.CustomerId,
                };
                GhnOrderStatusRequest ghnOrderStatusRequest = new GhnOrderStatusRequest
                {
                    OrderCode = order.ShippingCode,
                };
                /*client.BaseAddress = new Uri(_ghnSettings.GHNBaseUrl);
                client.DefaultRequestHeaders.Add("Token", _ghnSettings.Token);*/
                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // bỏ qua field null
                    PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase // GHN dùng snake_case -> mình map lại bằng [JsonPropertyName]
                };
                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(ghnOrderStatusRequest, options),
                    Encoding.UTF8,
                    "application/json");
                var response = await _client.PostAsync("shiip/public-api/v2/shipping-order/detail", jsonContent);
                if (response.IsSuccessStatusCode)
                {
                    var resultGHN = await response.Content.ReadAsStringAsync();
                    GhnOrderStatusResponse responseGHNObject =
                        JsonSerializer.Deserialize<GhnOrderStatusResponse>(resultGHN);
                    if (responseGHNObject != null)
                    {
                        string oldStatus = order.Status;
                        switch (responseGHNObject.Data.Status)
                        {
                            case "delivering":
                                {
                                    order.Status = OrderStatusEnum.Delivering.ToString();
                                    break;
                                }
                            case "delivered":
                                {
                                    order.Status = OrderStatusEnum.Delivered.ToString();
                                    if (order.Status == OrderStatusEnum.Delivered.ToString())
                                    {
                                        order.DeliveredAt = DateTime.UtcNow.AddHours(7);
                                    }
                                    break;
                                }
                            case "returned":
                                {
                                    order.Status = OrderStatusEnum.Returned.ToString();
                                    requestCreateNotification.Title = $"Đơn hàng {order.OrderId} đã được hoàn tiền thành công";
                                    requestCreateNotification.Content =
                                        $"Do đơn hàng {order.OrderId} của bạn không nhận hàng nên tiền mua hàng đã được hoàn tiền vào ví bạn thành công.";
                                }
                                break;
                        }

                        if (oldStatus == order.Status)
                        {
                            await _unitOfWork.CommitTransactionAsync();
                            return new MessageModelWithData<GhnOrderSyncResponse>
                            {
                                Message =
                                    $"Trạng thái đơn hàng vẫn là {order.Status}. Không có thay đổi nào được thực hiện.",
                                StatusCode = StatusCodes.Status200OK,
                                Data = new GhnOrderSyncResponse
                                {
                                    OldStatus = oldStatus,
                                    NewStatus = order.Status,
                                }
                            };
                        }
                        requestCreateStatusLogs.Add(new RequestCreateStatusLog()
                        {
                            OrderId = order.OrderId,
                            Status = order.Status,
                            UpdateAt = DateTime.UtcNow.AddHours(7)
                        });
                        if (order.Status == OrderStatusEnum.Returned.ToString())
                        {
                            decimal amountRefund = (decimal)(order.Amount - order.ShippingMoney - order.InsuranceFee);
                            int refundResult = await _walletService.UpdateBalanceInWalletAsync(new RequestUpdateRecharge()
                            {
                                WalletId = order.Customer.WalletId.Value,
                                Amount = amountRefund,
                            }, TypeTransactionEnum.Refund.ToString());
                            if (refundResult > 0)
                            {
                                Transaction transaction = new Transaction()
                                {
                                    UserId = order.CustomerId,
                                    Status = TransactionStatusEnum.Success.ToString(),
                                    Money = amountRefund,
                                    Method = PaymentMethodEnum.Wallet.ToString(),
                                    Type = TypeTransactionEnum.Refund.ToString(),
                                    CreatedAt = DateTime.UtcNow.AddHours(7),
                                    UpdatedAt = DateTime.UtcNow.AddHours(7),
                                    OrderId = order.OrderId
                                };
                                await _transactionService.CreateTransactionAsync(transaction);
                                order.Status = OrderStatusEnum.Completed.ToString();
                                requestCreateStatusLogs.Add(new RequestCreateStatusLog()
                                {
                                    OrderId = order.OrderId,
                                    Status = order.Status,
                                    UpdateAt = DateTime.UtcNow.AddHours(7)
                                });
                            }
                        }

                        await _orderRepository.UpdateAsync(order);
                        int result = await _unitOfWork.SaveChanges();
                        await _statusLogService.CreateStatusLog(requestCreateStatusLogs);


                        if (order.Status == OrderStatusEnum.Delivering.ToString())
                        {
                            requestCreateNotification.Title = $"Đơn hàng {order.OrderId} đã được shipper lấy hàng";
                            requestCreateNotification.Content =
                                $"Đơn hàng {order.OrderId} của bạn đã được shipper lấy và đang trong quá trình vận chuyển.";
                        }
                        else if (order.Status == OrderStatusEnum.Delivered.ToString())
                        {
                            requestCreateNotification.Title = $"Đơn hàng {order.OrderId} đã được giao thành công";
                            requestCreateNotification.Content =
                                $"Đơn hàng {order.OrderId} của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!";
                        }

                        await _notificationService.CreateNotificationAsync(requestCreateNotification);
                        await _notificationHub.Clients.Group(order.CustomerId.ToString())
                            .SendAsync("ReceiveNotification", requestCreateNotification.Title);

                        await _unitOfWork.CommitTransactionAsync();
                        if (result > 0)
                        {
                            return new MessageModelWithData<GhnOrderSyncResponse>
                            {
                                Message = $"Cập nhật trạng thái đơn từ {oldStatus} thành {order.Status}",
                                StatusCode = StatusCodes.Status200OK,
                                Data = new GhnOrderSyncResponse
                                {
                                    OldStatus = oldStatus,
                                    NewStatus = order.Status,
                                }
                            };
                        }
                    }
                }
                //}

                return new MessageModelWithData<GhnOrderSyncResponse>
                {
                    Message = "Cập nhật trạng thái thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<MessageModel> UpdateAllOrderStatusInGHN()
        {
            List<Order> orders = await _orderRepository.GetAllOrdersReadyForGHNUpdate();
            if (orders == null || orders.Count == 0)
            {
                return new MessageModel
                {
                    Message = "Không có đơn hàng nào để cập nhật",
                    StatusCode = StatusCodes.Status200OK
                };
            }

            var updateTasks = new List<Task<Tuple<Order, string>>>();
            foreach (Order order in orders)
            {
                // Khởi tạo một Task để lấy trạng thái GHN.
                // Hàm này trả về một Tuple chứa Order và trạng thái mới từ GHN.
                updateTasks.Add(GetGhnStatusForOrder(order));
            }

            try
            {
                // Chờ tất cả Task kết thúc.
                await Task.WhenAll(updateTasks);
            }
            catch (Exception)
            {
            }

            var resultsFromGHN = new List<Tuple<Order, string>>();
            var errors = new List<Exception>();
            foreach (var task in updateTasks)
            {
                if (task.Status == TaskStatus.RanToCompletion)
                {
                    resultsFromGHN.Add(task.Result);
                }
                else if (task.Status == TaskStatus.Faulted)
                {
                    if (task.Exception is AggregateException aggEx)
                    {
                        errors.AddRange(aggEx.InnerExceptions);
                    }
                    else
                    {
                        errors.Add(task.Exception);
                    }
                }
            }

            int successCount = 0;
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                List<RequestCreateNotification> notifications = new List<RequestCreateNotification>();
                List<RequestCreateStatusLog> statusLogs = new List<RequestCreateStatusLog>();
                List<Transaction> requestCreateTransactions = new List<Transaction>();
                foreach (var (order, newGhnStatus) in resultsFromGHN)
                {
                    RequestCreateNotification newNotification = new RequestCreateNotification()
                    {
                        ReceiverId = order.CustomerId,
                    };
                    string oldStatus = order.Status;
                    string newSystemStatus = oldStatus;
                    switch (newGhnStatus)
                    {
                        case "delivering":
                            newSystemStatus = OrderStatusEnum.Delivering.ToString();
                            break;
                        case "delivered":
                            newSystemStatus = OrderStatusEnum.Delivered.ToString();
                            break;
                        case "returned":
                            newSystemStatus = OrderStatusEnum.Returned.ToString();
                            newNotification.Title = $"Đơn hàng {order.OrderId} đã được hoàn tiền thành công";
                            newNotification.Content =
                                    $"Do đơn hàng {order.OrderId} của bạn không nhận hàng nên tiền mua hàng đã được hoàn tiền vào ví bạn thành công.";
                            break;
                    }

                    if (!oldStatus.Equals(newSystemStatus))
                    {
                        order.Status = newSystemStatus;
                        if (order.Status == OrderStatusEnum.Delivered.ToString())
                        {
                            order.DeliveredAt = DateTime.UtcNow.AddHours(7);
                        }
                        statusLogs.Add(new RequestCreateStatusLog()
                        {
                            OrderId = order.OrderId,
                            Status = order.Status,
                            UpdateAt = DateTime.UtcNow.AddHours(7)
                        });
                        if (order.Status == OrderStatusEnum.Returned.ToString())
                        {
                            decimal amountRefund = (decimal)(order.Amount - order.ShippingMoney - order.InsuranceFee);
                            int refundResult = await _walletService.UpdateBalanceInWalletAsync(new RequestUpdateRecharge()
                            {
                                WalletId = order.Customer.WalletId.Value,
                                Amount = amountRefund,
                            }, TypeTransactionEnum.Refund.ToString());
                            if (refundResult > 0)
                            {
                                Transaction transaction = new Transaction()
                                {
                                    UserId = order.CustomerId,
                                    Status = TransactionStatusEnum.Success.ToString(),
                                    Money = amountRefund,
                                    Method = PaymentMethodEnum.Wallet.ToString(),
                                    Type = TypeTransactionEnum.Refund.ToString(),
                                    CreatedAt = DateTime.UtcNow.AddHours(7),
                                    UpdatedAt = DateTime.UtcNow.AddHours(7),
                                    OrderId = order.OrderId
                                };
                                requestCreateTransactions.Add(transaction);
                                order.Status = OrderStatusEnum.Completed.ToString();
                                statusLogs.Add(new RequestCreateStatusLog()
                                {
                                    OrderId = order.OrderId,
                                    Status = order.Status,
                                    UpdateAt = DateTime.UtcNow.AddHours(7)
                                });
                            }
                        }
                        await _orderRepository.UpdateAsync(order);
                        successCount++;

                        if (order.Status == OrderStatusEnum.Delivering.ToString())
                        {
                            newNotification.Title = $"Đơn hàng {order.OrderId} đã được shipper lấy hàng";
                            newNotification.Content =
                                $"Đơn hàng {order.OrderId} của bạn đã được shipper lấy và đang trong quá trình vận chuyển.";
                        }
                        else if (order.Status == OrderStatusEnum.Delivered.ToString())
                        {
                            newNotification.Title = $"Đơn hàng {order.OrderId} đã được giao thành công";
                            newNotification.Content =
                                $"Đơn hàng {order.OrderId} của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!";
                        }

                        notifications.Add(newNotification);
                    }
                }

                if (successCount > 0)
                {
                    await _unitOfWork.SaveChanges();
                    await _statusLogService.CreateStatusLog(statusLogs);
                    await _notificationService.CreateListNotificationAsync(notifications);
                    await _transactionService.CreateListTransactionAsync(requestCreateTransactions);
                    await _unitOfWork.CommitTransactionAsync();
                    var notificationSendToCustomer = notifications.GroupBy(n => n.ReceiverId);
                    foreach (var item in notificationSendToCustomer)
                    {
                        if (item.Count() > 1)
                        {
                            await _notificationHub.Clients.Group(item.First().ReceiverId.ToString())
                                .SendAsync("ReceiveNotification", "Các đơn hàng của bạn đã được cập nhật trạng thái");
                        }
                        else
                        {
                            var singleNotification = item.First();
                            await _notificationHub.Clients.Group(singleNotification.ReceiverId.ToString())
                                .SendAsync("ReceiveNotification", singleNotification.Title);
                        }
                    }
                    return new MessageModel
                    {
                        Message = $"Đã cập nhật trạng thái cho {successCount} đơn hàng",
                        StatusCode = StatusCodes.Status200OK
                    };
                }

                return new MessageModel
                {
                    Message = "Cập nhật trạng thái cho đơn hàng thất bại",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        private async Task<Tuple<Order, string>> GetGhnStatusForOrder(Order order)
        {
            if (string.IsNullOrEmpty(order.ShippingCode))
            {
                throw new ArgumentException($"Order ID {order.OrderId} không có mã vận đơn GHN (ShippingCode).");
            }

            try
            {
                GhnOrderStatusRequest ghnOrderStatusRequest = new GhnOrderStatusRequest
                {
                    OrderCode = order.ShippingCode,
                };
                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(ghnOrderStatusRequest, options),
                    Encoding.UTF8,
                    "application/json");
                var response = await _client.PostAsync("shiip/public-api/v2/shipping-order/detail", jsonContent);
                if (response.IsSuccessStatusCode)
                {
                    var resultGHN = await response.Content.ReadAsStringAsync();
                    GhnOrderStatusResponse responseGHNObject =
                        JsonSerializer.Deserialize<GhnOrderStatusResponse>(resultGHN);
                    if (responseGHNObject?.Data != null && responseGHNObject.Data.Status != null)
                    {
                        return new Tuple<Order, string>(order, responseGHNObject.Data.Status);
                    }

                    throw new Exception($"Không lấy được trạng thái hợp lệ từ GHN cho mã {order.ShippingCode}.");
                }

                string errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"GHN API trả về lỗi HTTP {(int)response.StatusCode} cho mã {order.ShippingCode}. Chi tiết: {errorContent}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Không thể cập nhật trạng thái GHN cho mã {order.ShippingCode}.", ex);
            }
        }

        public async Task<MessageModelWithData<bool>> CanRequestOrderRefund(int orderId)
        {
            Order order = await _orderRepository.GetOrderByOrderID(orderId);
            if (order == null)
            {
                throw new Exception("Không tìm thấy đơn hàng");
            }
            if (order.Status != OrderStatusEnum.Delivered.ToString())
            {
                throw new Exception("Không thể tạo đơn hoàn hàng");
            }
            bool hasAnyActiveRefund = await _orderRefundRepository.CheckNonRejectedRefundByOrderId(orderId);
            if (hasAnyActiveRefund)
            {
                throw new Exception("Đơn hàng hiện tại đã có yêu cầu hoàn hàng");
            }

            if (order.DeliveredAt != null && DateTime.UtcNow.AddHours(7) <= order.DeliveredAt.Value.AddDays(2))
            {
                return new MessageModelWithData<bool>
                {
                    Message = "Thời gian hoàn hàng hợp lệ",
                    StatusCode = StatusCodes.Status200OK,
                    Data = true
                };
            }

            return new MessageModelWithData<bool>
            {
                Message = "Thời gian hoàn hàng không hợp lệ",
                StatusCode = StatusCodes.Status400BadRequest,
                Data = false
            };

        }
    }
}