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
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.User;
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
                    productVariantIds.Add(item.ProductVariantId);
                    await _productVariantService.UpdateAsync(item.ProductVariantId,new UpdateProductVariantRequest()
                    {
                        Quantity = productVariant?.Quantity - item.Quantity
                    },true);
                    orderDetails.Add(orderDetail);
                }

                await _cartService.RemoveMultipleProductsFromCartAsync(productVariantIds);
                int result = await _orderDetailService.CreateOrderDetailAsync(orderDetails);
                if (result > 0)
                {
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

        public async Task<ResponseOrder?> GetOrderByIdAsync(int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order không tồn tại");
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
    }
}
