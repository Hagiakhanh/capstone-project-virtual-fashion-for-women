using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Order;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderService
    {
        public Task<Order> CreateOrderAsync(RequestCreateOrder requestCreateOrder);
        Task<ResponseOrder?> GetOrderByIdAsync(int orderId);
        Task<int> UpdateOrderStatusAsync(string status, int orderId);
        
    }
}
