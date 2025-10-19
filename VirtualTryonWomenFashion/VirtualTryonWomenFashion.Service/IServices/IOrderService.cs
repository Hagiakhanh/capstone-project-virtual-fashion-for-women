using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.GHN;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderService
    {
        public Task<MessageModelWithData<Pagination<ResponseOrderForStaff>>> GetAllOrderForStaff(PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease);
        public Task<MessageModelWithData<ResponseOrderDetailForStaff>> GetOrderDetailForStaff(int orderID);
        public Task<MessageModelWithData<string>> UpdateOrderStatusForStaff(int orderID);
        public Task<Order> CreateOrderAsync(RequestCreateOrder requestCreateOrder);
        Task<ResponseOrder?> GetOrderByIdAsync(int orderId, int? userId = null);
        Task<int> UpdateOrderStatusAsync(string status, int orderId);
        Task<int> UpdatePaymentUrlAsync(string paymentUrl, int orderId);
        Task<List<Order>> GetOrdersByStatusAsync(string status);
        Task<Pagination<ResponseOrder>> GetAllOrdersForCustomer(PaginationParameter page, string orderStatus);
        Task HandleFailedOrders(List<Order> failedOrders);
        Task HandleSuccessfulOrders(List<Order> successfulOrders);
        public Task<MessageModelWithData<GhnOrderSyncResponse>> UpdateOrderStatusInGHNByCode(int orderId);
        public Task<MessageModel> UpdateAllOrderStatusInGHN();
    }
}
