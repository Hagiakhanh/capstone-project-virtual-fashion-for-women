using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderDetailService
    {
        public Task<int> CreateOrderDetailAsync(List<OrderDetail> createOrderDetails);
        public Task<List<ResponseOrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId);
        public Task<List<OrderDetail>> GetOrderDetailsByOrderIdsAsync(List<int> orderIds);
    }
}
