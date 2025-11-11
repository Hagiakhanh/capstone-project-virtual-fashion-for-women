using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IOrderRefundRepository : IGenericRepository<OrderRefund>
    {
        public Task<bool> CheckNonRejectedRefundByOrderId(int orderId);
        public Task<List<OrderRefund>> GetListOrderRefundForCustomer(string? status, int pageIndex, int pageSize, int userId);
        public Task<OrderRefund> GetOrderRefundById(int orderRefundId);
        public Task<List<OrderRefund>> GetAllOrderRefundReadyForGHNUpdate();
    }
}
