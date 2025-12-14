using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IOrderDetailRepository : IGenericRepository<OrderDetail>
    {
        public Task<List<OrderDetail>> GetOrderDetailsByOrderId(int orderId);
        Task<Product> GetProductByOrderDetailIdAsync(int orderDetailId);
        Task<List<OrderDetail>> GetUserOrderDetailsAsync(int userId);
        Task<List<OrderDetail>> GetAllOrderDetailsAsync();
        public Task<List<OrderDetail>> GetByListOrderDetailIdAsync(List<int> orderDetailId);
        Task<List<OrderDetail>> GetOrderDetailsForSystemStatisticAsync();
        Task<List<OrderDetail>> GetRevenueOrderDetailsAsync(
            DateTime start,
            DateTime end);
    }
}
