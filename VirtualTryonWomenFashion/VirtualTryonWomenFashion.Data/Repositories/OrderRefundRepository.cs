using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class OrderRefundRepository : GenericRepository<OrderRefund>, IOrderRefundRepository
    {
        public OrderRefundRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<bool> CheckNonRejectedRefundByOrderId(int orderId)
        {
            return await _context.OrderRefunds.AnyAsync(x => x.OrderId == orderId
                            && x.Status != OrderRefundStatusEnum.Rejected.ToString());
        }

        public async Task<List<OrderRefund>> GetListOrderRefundForCustomer(string? status, int pageIndex, int pageSize, int userId)
        {
            IQueryable<OrderRefund> query = _context.OrderRefunds
                .Include(x => x.OrderRefundDetails)
                    .ThenInclude(x => x.OrderDetail)
                    .ThenInclude(x => x.ProductVariant)
                .Include(x => x.Order);

            query = query.Where(x => x.CustomerId == userId);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(x => x.Status == status);
            }

            query = query.OrderByDescending(x => x.CreatedAt);

            query = query
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize);
            return await query.ToListAsync();
        }

        public async Task<OrderRefund> GetOrderRefundById(int orderRefundId)
        {
            return await _context.OrderRefunds
                .Include(x => x.OrderRefundDetails)
                    .ThenInclude(x => x.OrderDetail)
                    .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.ProductColor)
                    .ThenInclude(x => x.Color)
                 .Include(x => x.OrderRefundDetails)
                    .ThenInclude(x => x.OrderDetail)
                    .ThenInclude(x => x.ProductVariant)
                    .ThenInclude(x => x.Size)
                .Include(x => x.Customer)
                .Include(x => x.Order)
                .Include(x => x.Transaction)
                .FirstOrDefaultAsync(x => x.OrderRefundId == orderRefundId);
        }
    }
}
