using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.GHN;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderRefundService : IOrderRefundService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderRefundRepository _orderRefundRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IOrderRefundDetailRepository _orderRefundDetailRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IOrderRefundImageRepository _orderRefundImageRepository;
        private readonly IShippingService _shippingService;
        private readonly HttpClient _client;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IStatusLogService _statusLogService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly IWalletRepository _walletRepository;
        private readonly IShopAddressRepository _shopAddressRepository;

        public OrderRefundService(ICurrentUserService currentUserService, IOrderRepository orderRepository,
            IOrderRefundRepository orderRefundRepository, IUnitOfWork unitOfWork, IOrderDetailRepository orderDetailRepository,
            IOrderRefundDetailRepository orderRefundDetailRepository, ICloudinaryService cloudinaryService,
            IOrderRefundImageRepository orderRefundImageRepository, IShippingService shippingService,
            HttpClient client, ITransactionRepository transactionRepository, IStatusLogService statusLogService,
            INotificationService notificationService, IHubContext<NotificationHub> notificationHub,
            IWalletRepository walletRepository, IShopAddressRepository shopAddressRepository)
        {
            _currentUserService = currentUserService;
            _orderRepository = orderRepository;
            _orderRefundRepository = orderRefundRepository;
            _unitOfWork = unitOfWork;
            _orderDetailRepository = orderDetailRepository;
            _orderRefundDetailRepository = orderRefundDetailRepository;
            _cloudinaryService = cloudinaryService;
            _orderRefundImageRepository = orderRefundImageRepository;
            _shippingService = shippingService;
            _client = client;
            _transactionRepository = transactionRepository;
            _statusLogService = statusLogService;
            _notificationService = notificationService;
            _notificationHub = notificationHub;
            _walletRepository = walletRepository;
            _shopAddressRepository = shopAddressRepository;
        }
        public async Task<MessageModel> CreateOrderRefund(RequestCreateOrderRefund requestCreateOrderRefund)
        {
            int customerId = _currentUserService.GetUserId();
            Order order = await _orderRepository.GetOrderByOrderID(requestCreateOrderRefund.OrderID);
            if (order == null)
            {
                throw new Exception("Đơn hàng không tồn tại");
            }
            if (order.Customer.UserId != customerId)
            {
                throw new Exception("Đơn hàng không phải của bạn, không có quyền hoàn hàng");
            }
            if (order.Status != OrderStatusEnum.Delivered.ToString())
            {
                throw new Exception($"Trạng thái hiện tại là {order.Status}, không thể hoàn hàng");
            }
            bool hasAnyActiveRefund = await _orderRefundRepository.CheckNonRejectedRefundByOrderId(requestCreateOrderRefund.OrderID);
            if (hasAnyActiveRefund)
            {
                throw new Exception("Đơn hàng hiện tại đã có yêu cầu hoàn hàng");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                int countOrderRefund = await _orderRefundRepository.CountAsync(x => x.OrderId == requestCreateOrderRefund.OrderID);
                OrderRefund newOrderRefund = new OrderRefund
                {
                    OrderId = requestCreateOrderRefund.OrderID,
                    CustomerId = customerId,
                    CustomerReason = requestCreateOrderRefund.CustomerReason,
                    Status = OrderRefundStatusEnum.Pending.ToString(),
                    AttemptNumber = countOrderRefund + 1,
                    RefundAmount = 0,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    UpdatedAt = DateTime.UtcNow.AddHours(7)
                };
                await _orderRefundRepository.InsertAsync(newOrderRefund);
                await _unitOfWork.SaveChanges();

                decimal totalRefundAmount = 0;
                List<OrderRefundDetail> refundDetails = new List<OrderRefundDetail>();

                if (requestCreateOrderRefund.Items != null && requestCreateOrderRefund.Items.Any())
                {
                    // Trả theo từng item
                    List<int> orderDetailIds = requestCreateOrderRefund.Items.Select(x => x.OrderDetailID).ToList();
                    List<OrderDetail> orderDetails = await _orderDetailRepository.GetByListOrderDetailIdAsync(orderDetailIds);

                    foreach (var item in requestCreateOrderRefund.Items)
                    {
                        OrderDetail orderDetail = orderDetails.FirstOrDefault(x => x.OrderDetailId == item.OrderDetailID && x.OrderId == order.OrderId);
                        if (orderDetail == null || orderDetail.OrderId != order.OrderId)
                        {
                            throw new Exception($"Chi tiết sản phẩm {item.OrderDetailID} không hợp lệ");
                        }
                        OrderRefundDetail orderRefundDetail = new OrderRefundDetail
                        {
                            OrderRefundId = newOrderRefund.OrderRefundId,
                            OrderDetailId = orderDetail.OrderDetailId,
                            Quantity = orderDetail.Quantity,
                            RefundPriceAtTime = orderDetail.PriceAtTime,
                        };
                        refundDetails.Add(orderRefundDetail);

                        totalRefundAmount += orderDetail.Quantity * orderDetail.PriceAtTime;
                        //await _orderRefundDetailRepository.InsertAsync(orderRefundDetail);

                    }
                }
                else
                {
                    List<OrderDetail> allOrderDetails = await _orderDetailRepository.GetOrderDetailsByOrderId(order.OrderId);
                    foreach (var detail in allOrderDetails)
                    {
                        OrderRefundDetail orderRefundDetail = new OrderRefundDetail
                        {
                            OrderRefundId = newOrderRefund.OrderRefundId,
                            OrderDetailId = detail.OrderId,
                            Quantity = detail.Quantity,
                            RefundPriceAtTime = detail.PriceAtTime,
                        };
                        refundDetails.Add(orderRefundDetail);

                        totalRefundAmount += detail.Quantity * detail.PriceAtTime;
                        //await _orderRefundDetailRepository.InsertAsync(orderRefundDetail);
                    }

                }

                // Insert tổng order refund detail
                await _orderRefundDetailRepository.AddRangeAsync(refundDetails);

                // Cập nhật tổng số tiền hoàn
                newOrderRefund.RefundAmount = totalRefundAmount;
                await _orderRefundRepository.UpdateAsync(newOrderRefund);

                // Upload ảnh và lưu vào bảng OrderRefundImage
                if (requestCreateOrderRefund.ImageUrl != null && requestCreateOrderRefund.ImageUrl.Length > 0)
                {
                    var uploadTasks = requestCreateOrderRefund.ImageUrl
                                        .Select(file => _cloudinaryService.UploadImageAsync(file))
                                        .ToList();
                    var uploadedUrls = await Task.WhenAll(uploadTasks);

                    List<OrderRefundImage> refundImages = uploadedUrls
                                        .Select(url => new OrderRefundImage
                                        {
                                            OrderRefundId = newOrderRefund.OrderRefundId,
                                            ImageUrl = url,
                                        })
                                        .ToList();

                    await _orderRefundImageRepository.AddRangeAsync(refundImages);
                }

                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Tạo yêu cầu hoàn hàng thành công",
                        StatusCode = StatusCodes.Status200OK
                    };
                }
                return new MessageModel
                {
                    Message = "Tạo yêu cầu hoàn hàng thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

        }

        public async Task<MessageModelWithData<Pagination<ResponseListOrderRefund>>> ListOrderRefundForCustomer(PaginationParameter page, OrderRefundStatusEnum? statusEnum)
        {
            int customerId = _currentUserService.GetUserId();
            Expression<Func<OrderRefund, bool>> filterExpression = x => !statusEnum.HasValue || x.Status == statusEnum.Value.ToString();

            List<OrderRefund> orderRefunds = await _orderRefundRepository.GetListOrderRefundForCustomer(statusEnum.ToString(), page.PageIndex, page.PageSize, customerId);

            List<ResponseListOrderRefund> responseListOrderRefunds = orderRefunds.Select(x => new ResponseListOrderRefund
            {
                OrderRefundId = x.OrderRefundId,
                Status = x.Status,
                Amount = x.RefundAmount,
                CreatedAt = x.CreatedAt,
                Address = x.Order.ReceiverAddress,
                itemRefunds = x.OrderRefundDetails.Select(item => new ItemRefund
                {
                    ProductVarientName = item.OrderDetail.ProductVariant.VariantName,
                    ProductVarientImage = item.OrderDetail.ProductVariant.ImageUrl
                }).ToList()
            }).ToList();

            int totalCount = await _orderRefundRepository.CountAsync(filterExpression);
            Pagination<ResponseListOrderRefund> pageResult = new Pagination<ResponseListOrderRefund>(responseListOrderRefunds, totalCount, page.PageIndex, page.PageSize);

            if (responseListOrderRefunds.Any())
            {
                return new MessageModelWithData<Pagination<ResponseListOrderRefund>>
                {
                    Message = "Danh sách đơn hoàn hàng",
                    StatusCode = StatusCodes.Status200OK,
                    Data = pageResult
                };
            }

            return new MessageModelWithData<Pagination<ResponseListOrderRefund>>
            {
                Message = "Danh sách đơn hoàn hàng trống",
                StatusCode = StatusCodes.Status200OK,
                Data = pageResult
            };

        }

        public async Task<MessageModelWithData<Pagination<ResponseOrderRefundStaff>>> ListOrderRefundForStaff(PaginationParameter page, OrderRefundStatusEnum? statusEnum)
        {
            Expression<Func<OrderRefund, bool>> filterExpression =
                x => !statusEnum.HasValue || x.Status == statusEnum.ToString();
            int totalCount = await _orderRefundRepository.CountAsync(filterExpression);

            List<OrderRefund> orderRefunds = await _orderRefundRepository.GetAll(
                    pagination: page,
                    filter: filterExpression,
                    includes: new Expression<Func<OrderRefund, object>>[]
                    {
                        x => x.Order,
                        x => x.Customer
                    },
                    orderBy: x => x.OrderByDescending(x => x.CreatedAt)
                );

            List<ResponseOrderRefundStaff> responseOrderRefundStaff = orderRefunds.Select(x => new ResponseOrderRefundStaff
            {
                OrderRefundId = x.OrderRefundId,
                CreatedAt = x.CreatedAt,
                ReceiverName = x.Order.ReceiverName,
                ReceiverPhone = x.Order.ReceiverPhone,
                Email = x.Customer.Email,
                Reason = x.CustomerReason,
                Amount = x.RefundAmount,
                Status = x.Status
            }).ToList();

            if (responseOrderRefundStaff.Any())
            {
                return new MessageModelWithData<Pagination<ResponseOrderRefundStaff>>
                {
                    Message = "Lấy dữ liệu yêu cầu hoàn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = new Pagination<ResponseOrderRefundStaff>(responseOrderRefundStaff, totalCount, page.PageIndex, page.PageSize)
                };
            }

            return new MessageModelWithData<Pagination<ResponseOrderRefundStaff>>
            {
                Message = "Không tìm thấy yêu cầu hoàn hàng nào thỏa mãn điều kiện",
                StatusCode = StatusCodes.Status200OK,
                Data = new Pagination<ResponseOrderRefundStaff>(
                    new List<ResponseOrderRefundStaff>(),
                    0,
                    page.PageIndex,
                    page.PageSize
                )
            };

        }

        public async Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForCustomer(int orderRefundId)
        {
            int customerId = _currentUserService.GetUserId();
            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(orderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("Yêu cầu hoàn hàng không hợp lệ");
            }
            if (orderRefund.CustomerId != customerId)
            {
                throw new Exception("Không có quyền xem chi tiết yêu cầu hoàn hàng này");
            }

            int productCount = orderRefund.OrderRefundDetails.Count();
            decimal amountRefund = orderRefund.OrderRefundDetails.Sum(detail => detail.Quantity * detail.RefundPriceAtTime);

            ResponseOrderRefundDetail responseOrderRefundDetail = new ResponseOrderRefundDetail
            {
                OrderRefundId = orderRefund.OrderRefundId,
                CreatedAt = orderRefund.CreatedAt,
                OrderRefundStatus = orderRefund.Status,
                ProductCount = productCount,
                CustomerName = orderRefund.Customer.FullName,
                CustomerPhone = orderRefund.Customer.PhoneNumber,
                CustomerEmail = orderRefund.Customer.Email,
                ReceiverName = orderRefund.Order.ReceiverName,
                ReceiverAddress = orderRefund.Order.ReceiverAddress,
                ReceiverPhone = orderRefund.Order.ReceiverPhone,
                Amount = amountRefund,
                TransactionStatus = orderRefund.Transaction?.Status,
                TransactionTime = orderRefund.Transaction?.CreatedAt,
                CustomerReason = orderRefund.CustomerReason,
                StaffResponse = orderRefund.StaffResponse,
                ShippingCode = orderRefund?.ShippingCode,
                CustomerImage = orderRefund.OrderRefundImages.Select(x => x.ImageUrl).ToList(),
                Items = orderRefund.OrderRefundDetails.Select(detail => new OrderRefundDetailItem
                {
                    VariantName = detail.OrderDetail.ProductVariant.VariantName,
                    VariantImage = detail.OrderDetail.ProductVariant.ImageUrl,
                    VariantColor = detail.OrderDetail.ProductVariant.ProductColor.Color.ColorName,
                    VariantSize = detail.OrderDetail.ProductVariant.Size.SizeCode,
                    VariantPrice = detail.OrderDetail.PriceAtTime,
                    Quantity = detail.OrderDetail.Quantity,
                    VariantAmount = detail.OrderDetail.Quantity * detail.OrderDetail.PriceAtTime,
                }).ToList(),
            };

            return new MessageModelWithData<ResponseOrderRefundDetail>
            {
                Message = "Thông tin chi tiết yêu cầu hoàn hàng",
                StatusCode = StatusCodes.Status200OK,
                Data = responseOrderRefundDetail
            };

        }

        public async Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForrStaff(int orderRefundId)
        {
            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(orderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("ID của yêu cầu hoàn hàng không hợp lệ");
            }

            ResponseOrderRefundDetail responseOrderRefundDetail = new ResponseOrderRefundDetail
            {
                OrderRefundId = orderRefund.OrderRefundId,
                CreatedAt = orderRefund.CreatedAt,
                OrderRefundStatus = orderRefund.Status,
                ProductCount = orderRefund.OrderRefundDetails.Count(),
                CustomerName = orderRefund.Customer.FullName,
                CustomerPhone = orderRefund.Customer.PhoneNumber,
                CustomerEmail = orderRefund.Customer.Email,
                ReceiverName = orderRefund.Order.ReceiverName,
                ReceiverAddress = orderRefund.Order.ReceiverAddress,
                ReceiverPhone = orderRefund.Order.ReceiverPhone,
                Amount = orderRefund.RefundAmount,
                TransactionStatus = orderRefund.Transaction?.Status,
                TransactionTime = orderRefund.Transaction?.CreatedAt,
                CustomerReason = orderRefund.CustomerReason,
                StaffResponse = orderRefund.StaffResponse,
                ShippingCode = orderRefund?.ShippingCode,
                CustomerImage = orderRefund.OrderRefundImages.Select(x => x.ImageUrl).ToList(),
                Items = orderRefund.OrderRefundDetails.Select(detail => new OrderRefundDetailItem
                {
                    VariantName = detail.OrderDetail.ProductVariant.VariantName,
                    VariantImage = detail.OrderDetail.ProductVariant.ImageUrl,
                    VariantColor = detail.OrderDetail.ProductVariant.ProductColor.Color.ColorName,
                    VariantSize = detail.OrderDetail.ProductVariant.Size.SizeCode,
                    VariantPrice = detail.OrderDetail.PriceAtTime,
                    Quantity = detail.OrderDetail.Quantity,
                    VariantAmount = detail.OrderDetail.Quantity * detail.OrderDetail.PriceAtTime,
                }).ToList(),
            };

            return new MessageModelWithData<ResponseOrderRefundDetail>
            {
                Message = "Thông tin chi tiết yêu cầu hoàn hàng",
                StatusCode = StatusCodes.Status200OK,
                Data = responseOrderRefundDetail
            };

        }

        public async Task<MessageModelWithData<string>> UpdateOrderRefundForStaff(RequestUpdateOrderRefund requestUpdateOrderRefund)
        {
            int staffId = _currentUserService.GetUserId();

            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(requestUpdateOrderRefund.OrderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("ID của yêu cầu không hợp lệ");
            }
            if (orderRefund.Status != OrderRefundStatusEnum.Pending.ToString())
            {
                throw new Exception($"Trạng thái hiện tại của đơn là {orderRefund.Status} không thể hoàn hàng");
            }
            if (orderRefund.StaffId != null)
            {
                throw new Exception("Yêu cầu đã có staff xử lý");
            }
            if (String.IsNullOrEmpty(requestUpdateOrderRefund.StaffResponse))
            {
                throw new Exception("Phản hồi của nhân viên không được để trống");
            }
            if (requestUpdateOrderRefund.StatusEnum.ToString() != OrderRefundStatusEnum.Accepted.ToString()
                && requestUpdateOrderRefund.StatusEnum.ToString() != OrderRefundStatusEnum.Rejected.ToString())
            {
                throw new Exception("Trạng thái cập nhập cho đơn hàng không hợp lệ (Accepted: 1, Rejected: 2)");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (requestUpdateOrderRefund.StatusEnum.ToString() == OrderRefundStatusEnum.Rejected.ToString())
                {
                    // Giải quyết khi từ chối
                    orderRefund.Status = OrderRefundStatusEnum.Rejected.ToString();
                    orderRefund.StaffResponse = requestUpdateOrderRefund.StaffResponse;
                    orderRefund.StaffId = staffId;
                    await _orderRefundRepository.UpdateAsync(orderRefund);

                    int result = await _unitOfWork.SaveChanges();

                    RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                    {
                        ReceiverId = orderRefund.CustomerId,
                        Title = $"Yêu cầu hàng {orderRefund.OrderRefundId} đã bị từ chối",
                        Content =
                        $"Yêu cầu hoàn hàng {orderRefund.OrderRefundId} của bạn đã bị từ chối bởi nhân viên."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotification);
                    await _notificationHub.Clients.Group(orderRefund.CustomerId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotification.Title);
                    await _unitOfWork.CommitTransactionAsync();

                    if (result > 0)
                    {
                        return new MessageModelWithData<string>
                        {
                            Message = "Cập nhật trạng thái hoàn hàng",
                            StatusCode = StatusCodes.Status200OK,
                        };
                    }

                }
                else if (requestUpdateOrderRefund.StatusEnum.ToString() == OrderRefundStatusEnum.Accepted.ToString())
                {
                    // Giải quyết khi chấp nhận
                    // Cập nhật thông tin, Tạo đơn giao hàng, Tạo pending transaction
                    orderRefund.Status = OrderRefundStatusEnum.Accepted.ToString();
                    orderRefund.StaffResponse = requestUpdateOrderRefund.StaffResponse;
                    orderRefund.StaffId = staffId;

                    // Tạo transacton
                    Transaction newTransaction = new Transaction
                    {
                        UserId = orderRefund.Customer.UserId,
                        OrderRefundId = orderRefund.OrderRefundId,
                        WalletId = orderRefund.Customer.WalletId,
                        Status = TransactionStatusEnum.Pending.ToString(),
                        Money = orderRefund.RefundAmount,
                        Method = PaymentMethodEnum.Wallet.ToString(),
                        Type = TypeTransactionEnum.Refund.ToString(),
                        CreatedAt = DateTime.UtcNow.AddHours(7),
                        UpdatedAt = DateTime.UtcNow.AddHours(7)
                    };
                    await _transactionRepository.InsertAsync(newTransaction);


                    var fromWardName = await _shippingService.GetWardName(orderRefund.Order.DistrictId.Value);
                    var fromDistrictName = await _shippingService.GetDistrictName(orderRefund.Order.ProvinceId.Value);
                    var fromProvinceName = await _shippingService.GetProvinceName();

                    ShopAddress shopAddress = await _shopAddressRepository.GetShopAddress();

                    GhnCreateOrderRequest ghnCreateOrderRequest = new GhnCreateOrderRequest
                    {
                        PaymentTypeId = 1, // Người trả phí shop | 1: Seller, 2: Buyer
                        Note = "Khách hàng hoàn hàng", // Note của khách hàng cho shipper
                        RequiredNote =
                        "CHOXEMHANGKHONGTHU", // Các phương thức khi nhận hàng | CHOTHUHANG , CHOXEMHANGKHONGTHU , KHONGCHOXEMHANG 
                        FromName = orderRefund.Order.ReceiverName, // Tên của bên gửi 
                        FromPhone = orderRefund.Order.ReceiverPhone,   // Số điện thoại của bên gửi
                        FromAddress = orderRefund.Order.ReceiverAddress,  // Địa chỉ gửi
                        FromWardName = fromWardName[orderRefund.Order.WardCode], // Tên phường gửi | Phải theo api của GHN
                        FromDistrictName = fromDistrictName[orderRefund.Order.DistrictId.Value], // Tên huyện gửi | Phải theo api của GHN
                        FromProvinceName = fromProvinceName[orderRefund.Order.ProvinceId.Value], // Tên tỉnh gửi | Phải theo api của GHN

                        //ReturnPhone = "0868728859", // Số điện thoại để trả lại hàng
                        //ReturnAddress = "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",    // Địa chỉ trả hàng
                        //ReturnDistrictId = 3695,    // ID địa chỉ của huyện trả hàng | Phải theo api của GHN
                        //ReturnWardCode = "90752",   // ID địa chỉ của phường trả hàng | Phải theo api của GHN

                        ClientOrderCode = "", // Không thêm trường này
                        ToName = shopAddress.ShopName, // Tên của khách hàng
                        ToPhone = shopAddress.ShopPhone, // Số điện thoại của khách hàng
                        ToAddress = shopAddress.ShopAddress1, // Địa chỉ của khách hàng
                        ToWardCode = shopAddress.WardCode, // Phường của người nhận hàng | Phải theo api của GHN
                        ToDistrictId = shopAddress.DistrictId.Value, // Huyện của người nhận hàng | Phải theo api của GHN

                        CodAmount = 0, // Tiền COD mà shipper phải thu
                        Content = "Cửa hàng thời trang nữ", // Có thể đặt tên sản phẩm ở đây
                        Weight = (int)orderRefund.Order.PackageWeight.Value, // Cân nặng đơn
                        Length = (int)orderRefund.Order.PackageLength.Value, // Chiều dài đơn
                        Width = (int)orderRefund.Order.PackageWidth.Value, // Chiều rộng đơn
                        Height = (int)orderRefund.Order.PackageHeight.Value, // Chiều cao đơn
                        PickStationId = 1444, // Chưa rõ
                                              //DeliverStationId = null,    // Chưa rõ
                        InsuranceValue = (int)orderRefund.Order.Amount.Value, // Giá trị đơn hàng
                        ServiceId = 0, // Chưa rõ
                        ServiceTypeId = 2, // Loại dịch vụ giao | 2: E-commerce Delivery
                                           //Coupon = null,  // Mã phiếu giảm giá
                        PickShift = new List<int> { 3 } // Ca lấy hàng | 3: (7h00 - 12h00)
                    };

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
                        orderRefund.ShippingCode = resultGHNObj.Data.OrderCode;
                        //orderRefund.EstimatedDelivery = resultGHNObj.Data.ExpectedDeliveryTime;
                        await _orderRefundRepository.UpdateAsync(orderRefund);
                        int result = await _unitOfWork.SaveChanges();

                        RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                        {
                            ReceiverId = orderRefund.CustomerId,
                            Title = $"Yêu cầu hàng {orderRefund.OrderRefundId} đã được chấp nhận",
                            Content =
                            $"Yêu cầu hoàn hàng {orderRefund.OrderRefundId} của bạn đã được nhân viên xác nhận."
                        };
                        await _notificationService.CreateNotificationAsync(requestCreateNotification);
                        await _notificationHub.Clients.Group(orderRefund.CustomerId.ToString())
                            .SendAsync("ReceiveNotification", requestCreateNotification.Title);
                        await _unitOfWork.CommitTransactionAsync();
                        if (result > 0)
                        {
                            return new MessageModelWithData<string>
                            {
                                Message = "Cập nhật trạng thái hoàn hàng và tạo đơn vận chuyển thành công",
                                StatusCode = StatusCodes.Status200OK,
                                Data = $"{resultGHNObj.Data.OrderCode}"
                            };
                        }

                    }
                    else
                    {
                        await _unitOfWork.RollbackTransactionAsync();
                        var error = await response.Content.ReadAsStringAsync();
                        throw new Exception($"Không thể tạo đơn hàng vận chuyển. Lỗi GHN: {error}");
                    }
                }

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

        public async Task<MessageModelWithData<GhnOrderSyncResponse>> UpdateOrderRefundStatusInGHNByCode(int orderRefundId)
        {
            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(orderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("ID của yêu cầu hoàn hàng không hợp lệ");
            }
            if (orderRefund.Status != OrderRefundStatusEnum.Accepted.ToString()
                && orderRefund.Status != OrderRefundStatusEnum.Delivering.ToString())
            {
                throw new Exception($"Trạng thái yêu cầu hiện tại là {orderRefund.Status}, không thể cập nhật GHN");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                GhnOrderStatusRequest ghnOrderStatusRequest = new GhnOrderStatusRequest
                {
                    OrderCode = orderRefund.ShippingCode,
                };
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
                        string oldStatus = orderRefund.Status;
                        switch (responseGHNObject.Data.Status)
                        {
                            case "delivering":
                                {
                                    orderRefund.Status = OrderRefundStatusEnum.Delivering.ToString();
                                    break;
                                }
                            case "delivered":
                                {
                                    orderRefund.Status = OrderRefundStatusEnum.Delivered.ToString();
                                    break;
                                }
                        }

                        if (oldStatus == orderRefund.Status)
                        {
                            await _unitOfWork.CommitTransactionAsync();
                            return new MessageModelWithData<GhnOrderSyncResponse>
                            {
                                Message =
                                    $"Trạng thái đơn hàng vẫn là {orderRefund.Status}. Không có thay đổi nào được thực hiện.",
                                StatusCode = StatusCodes.Status200OK,
                                Data = new GhnOrderSyncResponse
                                {
                                    OldStatus = oldStatus,
                                    NewStatus = orderRefund.Status,
                                }
                            };
                        }

                        await _orderRefundRepository.UpdateAsync(orderRefund);
                        int result = await _unitOfWork.SaveChanges();

                        RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                        {
                            ReceiverId = orderRefund.CustomerId,
                        };
                        if (orderRefund.Status == OrderRefundStatusEnum.Delivering.ToString())
                        {
                            requestCreateNotification.Title = $"Yêu cầu hoàn {orderRefund.OrderId} đã được shipper lấy hàng";
                            requestCreateNotification.Content =
                                $"Yêu cầu hoàn {orderRefund.OrderId} của bạn đã được shipper lấy và đang trong quá trình vận chuyển.";
                        }
                        else if (orderRefund.Status == OrderRefundStatusEnum.Delivered.ToString())
                        {
                            requestCreateNotification.Title = $"Yêu cầu hoàn {orderRefund.OrderId} đã được giao thành công";
                            requestCreateNotification.Content =
                                $"Yêu cầu hoàn {orderRefund.OrderId} của bạn đã được giao thành công.";
                        }

                        await _notificationService.CreateNotificationAsync(requestCreateNotification);
                        await _notificationHub.Clients.Group(orderRefund.CustomerId.ToString())
                            .SendAsync("ReceiveNotification", requestCreateNotification.Title);

                        await _unitOfWork.CommitTransactionAsync();
                        if (result > 0)
                        {
                            return new MessageModelWithData<GhnOrderSyncResponse>
                            {
                                Message = $"Cập nhật trạng thái đơn từ {oldStatus} thành {orderRefund.Status}",
                                StatusCode = StatusCodes.Status200OK,
                                Data = new GhnOrderSyncResponse
                                {
                                    OldStatus = oldStatus,
                                    NewStatus = orderRefund.Status,
                                }
                            };
                        }
                    }
                }

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

        public async Task<MessageModel> RefundMoneyOrderStatus(int orderRefundId)
        {
            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(orderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("Id yêu cầu không hợp lệ");
            }
            if (orderRefund.Status != OrderRefundStatusEnum.Delivered.ToString())
            {
                throw new Exception($"Trạng thái hiện tại của đơn là {orderRefund.Status}, không thể hoàn tiền");
            }

            Wallet wallet = await _walletRepository.GetByIdAsync(orderRefund.Customer.WalletId);
            if (wallet == null)
            {
                throw new Exception("Không tìm thấy ví khách hàng");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                orderRefund.Status = OrderRefundStatusEnum.Completed.ToString();
                orderRefund.UpdatedAt = DateTime.UtcNow.AddHours(7);
                orderRefund.Transaction.Status = TransactionStatusEnum.Success.ToString();
                orderRefund.Transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _orderRefundRepository.UpdateAsync(orderRefund);

                wallet.Balance += orderRefund.RefundAmount;
                await _walletRepository.UpdateAsync(wallet);

                int result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    RequestCreateNotification requestCreateNotification = new RequestCreateNotification()
                    {
                        ReceiverId = orderRefund.CustomerId,
                        Title = $"Yêu cầu hàng {orderRefund.OrderRefundId} đã được hoàn tiền",
                        Content =
                            $"Yêu cầu hoàn hàng {orderRefund.OrderRefundId} của bạn đã được nhân viên hoàn tiền."
                    };
                    await _notificationService.CreateNotificationAsync(requestCreateNotification);
                    await _notificationHub.Clients.Group(orderRefund.CustomerId.ToString())
                        .SendAsync("ReceiveNotification", requestCreateNotification.Title);

                    await _unitOfWork.CommitTransactionAsync();
                    return new MessageModel
                    {
                        Message = "Hoàn tiền yêu cầu thành công",
                        StatusCode = StatusCodes.Status200OK
                    };
                }

                return new MessageModel
                {
                    Message = "Hoàn tiền yêu cầu thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

        }
    }
}
