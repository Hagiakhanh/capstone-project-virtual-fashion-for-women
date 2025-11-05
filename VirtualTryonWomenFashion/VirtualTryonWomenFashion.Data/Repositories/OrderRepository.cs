using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        public OrderRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<Order>> GetAllOrdersReadyForGHNUpdate()
        {
            List<Order> orders = await _context.Orders.Where(x => x.Status == OrderStatusEnum.Packed.ToString() ||
            x.Status == OrderStatusEnum.Delivering.ToString()).ToListAsync();
            return orders;
        }

        public async Task<Order?> GetOrderByOrderID(int orderID)
        {
            return await _context.Orders
                .Include(x => x.Customer)
                .Include(x => x.Transaction)
                .Include(x => x.OrderDetails)
                    .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.Size)
                .Include(x => x.OrderDetails)
                    .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.ProductColor)
                    .ThenInclude(x => x.Color)
                .Include(x => x.OrderDetails)
                    .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.ProductColor)
                    .ThenInclude(x => x.Product)
                .Include(x => x.StatusLogs)
                .SingleOrDefaultAsync(x => x.OrderId == orderID);
        }

        public async Task<List<Order>> GetOrdersByStatus(string status)
        {
            var orders = await _context.Orders
                .Where(o => o.Status == status)
                .Include(o => o.OrderDetails)
                .ToListAsync();
            return orders ??= new List<Order>();
        }
    }
}