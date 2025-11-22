using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        public Task<Order?> GetOrderByOrderID(int orderID);
        public Task<List<Order>> GetOrdersByStatus(string status);
        public Task<List<Order>> GetAllOrdersReadyForGHNUpdate();
        Task<List<Order>> GetAllOrdersForBasicStatisticAsync();
    }
}
