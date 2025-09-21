using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OrderService(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
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
