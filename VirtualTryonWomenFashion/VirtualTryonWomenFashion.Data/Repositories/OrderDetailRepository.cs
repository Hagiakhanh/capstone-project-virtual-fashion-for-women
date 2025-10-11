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

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class OrderDetailRepository : GenericRepository<OrderDetail>, IOrderDetailRepository
    {
        public OrderDetailRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<OrderDetail>> GetOrderDetailsByOrderId(int orderId)
        {
            var orderDetails = await _context.OrderDetails.Where(od => od.OrderId == orderId)
                .Include(od => od.Order)
                .Include(od =>od.ProductVariant)
                    .ThenInclude(pv => pv.Size)
                .Include(od=>od.ProductVariant)
                    .ThenInclude(pv =>pv.ProductColor)
                        .ThenInclude(pc => pc.ProductImages)
                .Include(od=>od.ProductVariant)
                    .ThenInclude(pv =>pv.ProductColor)
                        .ThenInclude(pc => pc.Color)
                .ToListAsync();
            return orderDetails ??= new List<OrderDetail>();
        }
    }
}
