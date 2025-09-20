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
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderDetailService _orderDetailService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICartService _cartService;
        private readonly IProductColorService _productColorService;

        public OrderService(
            IOrderRepository orderRepository,
            IUnitOfWork unitOfWork,
            IOrderDetailService orderDetailService,
            ICurrentUserService currentUserService,
            ICartService cartService,
            IProductColorService productColorService
            )
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _orderDetailService = orderDetailService;
            _currentUserService = currentUserService;
            _cartService = cartService;
            _productColorService = productColorService;
        }
        public async Task<string> CreateOrderAsync(RequestCreateOrder requestCreateOrder)
        {
            await _unitOfWork.BeginTransactionAsync();
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
                foreach (var item in cartItems)
                {
                    var productColor = await _productColorService.GetProductColorByIdAsync(item.ProductVariant.ProductColorId);
                    OrderDetail orderDetail = new OrderDetail()
                    {
                        OrderId = order.OrderId,
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        PriceAtTime =(decimal)productColor.Product.Price,
                        CampaignId = null
                    };
                    orderDetails.Add(orderDetail);
                }
                int result = await _orderDetailService.CreateOrderDetailAsync(orderDetails);
                if (result > 0)
                {
                    
                    await _unitOfWork.CommitTransactionAsync();
                    return "Create order successfully";
                }
                else
                {
                    throw new Exception("Create order failed");
                }
                              
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                Console.WriteLine($"Error occurred while create order in the cart: {ex.Message}.", ex);
                throw;
            }
        }
    }
}
