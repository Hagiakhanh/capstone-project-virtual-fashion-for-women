using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

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

        public OrderService(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            IOrderDetailService orderDetailService,
            ICurrentUserService currentUserService,
            ICartService cartService,
            IProductVariantService productVariantService
            )
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _orderDetailService = orderDetailService;
            _currentUserService = currentUserService;
            _cartService = cartService;
            _productVariantService = productVariantService;
        }
        public async Task<Order> CreateOrderAsync(RequestCreateOrder requestCreateOrder)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                var cartItems = await _cartService.GetSelectedCartItemsAsync(requestCreateOrder.productVariantIds);
               
                int totalWeight = (int) Math.Ceiling(cartItems.Sum(item => item.ProductVariant.ProductWeight * item.Quantity) ?? 0);
                int totalHeight = (int) Math.Ceiling(cartItems.Sum(item => item.ProductVariant.ProductHeight * item.Quantity) ?? 0);
                int totalWidth = (int) Math.Ceiling(cartItems.Max(c => c.ProductVariant.ProductWidth) ?? 0);
                int totalLength = (int) Math.Ceiling(cartItems.Max(c => c.ProductVariant.ProductLength) ?? 0);
                
                Order order = new Order()
                {
                    CustomerId = userId,
                    ReceiverName = requestCreateOrder.RecieverName,
                    ReceiverPhone = requestCreateOrder.RecieverPhone,
                    ReceiverAddress = requestCreateOrder.FullAddress,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    Note = requestCreateOrder.Note,
                    Status = OrderStatusEnum.Pending.ToString(),
                    Amount = requestCreateOrder.Amount,
                    PackageWeight =totalWeight,
                    PackageHeight = totalHeight,
                    PackageWidth = totalWidth,
                    PackageLength = totalLength,
                    ShippingMoney = requestCreateOrder.ShippingFee
                };
                await _orderRepository.InsertAsync(order);
                await _unitOfWork.SaveChanges();
                List<OrderDetail> orderDetails = new List<OrderDetail>();
                List<string> productVariantIds = new List<string>();
                foreach (var item in cartItems)
                {
                    var responseGetVariantPriceInfo = await _productVariantService.GetVariantPriceInfoAsync(item.ProductVariantId);
                    var productVariant = await _productVariantService.GetProductVariantById(item.ProductVariantId);
                    
                    OrderDetail orderDetail = new OrderDetail()
                    {
                        OrderId = order.OrderId,
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        PriceAtTime =(decimal)responseGetVariantPriceInfo.CurrentPrice,
                        CampaignId = responseGetVariantPriceInfo.HasActiveCampaign ? responseGetVariantPriceInfo.SaleCampaignInfo.CampaignId : null
                    };
                    await _productVariantService.UpdateAsync(item.ProductVariantId,new UpdateProductVariantRequest()
                    {
                        Quantity = productVariant?.Quantity - item.Quantity
                    },true);
                    productVariantIds.Add(item.ProductVariantId);
                    orderDetails.Add(orderDetail);
                }
                

                int result = await _orderDetailService.CreateOrderDetailAsync(orderDetails);
                if (result > 0)
                {
                    await _cartService.HideCartItemsAsync(productVariantIds);
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

        public async Task<ResponseOrder?> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order không tồn tại");
            }
            
            if(order.CustomerId != userId)
            {
                throw new Exception("Bạn không có quyền xem đơn hàng này");
            }

            var userInformation = new UserInformation();
            ResponseOrder responseOrder = order.MapToResponseOrder(userInformation);
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
                return await _unitOfWork.SaveChanges();
            }catch (Exception ex)
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
            }catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật link thanh toán của order: {ex.Message}");
            }
        }

        public async Task<List<Order>> GetOrdersByStatusAsync(string status)
        {
            var orders = await _orderRepository.GetOrdersByStatus(OrderStatusEnum.Pending.ToString());
            return orders;
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
            
            foreach (var order in failedOrders)
            {
                order.Status = OrderStatusEnum.Failed.ToString();
                order.PaymentUrl = null;
            }

            if(failedOrders == null || failedOrders.Count == 0)
                return;
            await _orderRepository.UpdateRangeAsync(failedOrders);
            await _unitOfWork.SaveChanges();

        }

        public async Task HandleSuccessfulOrders(List<Order> successfulOrders)
        {
            foreach (var order in successfulOrders)
            {
                order.Status = OrderStatusEnum.Confirmed.ToString();
                order.PaymentUrl = null;
            }

            if(successfulOrders == null || successfulOrders.Count == 0)
                return;
            await _orderRepository.UpdateRangeAsync(successfulOrders);
            await _unitOfWork.SaveChanges();
        }
        
        public async Task<MessageModelWithData<List<ResponseOrderForStaff>>> GetAllOrderForStaff(PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease)
        {
            List<Order> listOrder = new();
            if (isDateDecrease)
            {
                // Ngày mới nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    orderBy: x => x.OrderByDescending(x => x.CreatedAt)
                );
            }
            else
            {
                // Ngày cũ nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    orderBy: x => x.OrderBy(x => x.CreatedAt)
                );
            }
            List<ResponseOrderForStaff> responseOrderForStaff = listOrder.Select(
                    x => new ResponseOrderForStaff
                    {
                        OrderID = x.OrderId,
                        ReceiverName = x.ReceiverName,
                        ReceiverPhone = x.ReceiverPhone,
                        CreatedAt = x.CreatedAt,
                        Status = ((OrderStatusEnum)Enum.Parse(typeof(OrderStatusEnum), x.Status)).ToString(),
                    }
                ).ToList();

            if (responseOrderForStaff.Any())
            {
                return new MessageModelWithData<List<ResponseOrderForStaff>>()
                {
                    Message = "Lấy dữ liệu đơn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = responseOrderForStaff
                };
            }
            return new MessageModelWithData<List<ResponseOrderForStaff>>
            {
                Message = "Lấy dữ liệu đơn hàng thất bại",
                StatusCode = StatusCodes.Status400BadRequest,
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
                Amount = order.Amount,
                Note = order.Note,
                PackageWeight = order.PackageWeight,
                PackageHeight = order.PackageHeight,
                PackageWidth = order.PackageWidth,
                PackageLength = order.PackageLength,
                ShippingMoney = order.ShippingMoney,
                ShippingCode = order.ShippingCode,
                EstimatedDelivery = order.EstimatedDelivery,
                OrderDetails = order.OrderDetails.Select(x => new OrderDetailInformation
                {
                    OrderDetailID = x.OrderDetailId,
                    Quantity = x.Quantity,
                    VariantName = x.ProductVariant.VariantName,
                    ImageUrl = x.ProductVariant.ImageUrl,
                }).ToList(),
            };

            return new MessageModelWithData<ResponseOrderDetailForStaff>
            {
                Message = "Lấy dữ liệu chi tiết đơn hàng thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = responseData,
            };

        }

        public async Task<MessageModelWithData<string>> UpdateOrderStatusForStaff(int orderID, OrderStatusEnum newStatus)
        {
            Order? order = await _orderRepository.GetOrderByOrderID(orderID);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }
            if (order.Status != OrderStatusEnum.Confirmed.ToString() || newStatus != OrderStatusEnum.Packed)
            {
                throw new Exception("Trạng thái cập nhật không hợp lệ.");
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                order.Status = newStatus.ToString();

                // Gửi request cho giao hàng nhanh
                using (var client = new HttpClient())
                {

                }

                await _orderRepository.UpdateAsync(order);
                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                if (result > 0)
                {
                    return new MessageModelWithData<string>
                    {
                        Message = "Cập nhật trạng thái thành công",
                        StatusCode = StatusCodes.Status200OK,
                        Data = "Code vận chuyển"
                    };
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
    }
}
