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
        
        public async Task<Product> GetProductByOrderDetailIdAsync(int orderDetailId)
        {
            var product = await _context.OrderDetails
                .Where(od => od.OrderDetailId == orderDetailId)
                .Include(od => od.ProductVariant)
                .ThenInclude(pv => pv.ProductColor)
                .ThenInclude(pc => pc.Product)
                .ThenInclude(p => p.Category)
                .Select(od => od.ProductVariant.ProductColor.Product)
                .FirstOrDefaultAsync();
    
            return product;
        }
        
        public async Task<List<OrderDetail>> GetUserOrderDetailsAsync(int userId)
        {
            return await _context.OrderDetails
                .Include(od => od.ProductVariant)
                    .ThenInclude(pv => pv.ProductColor)
                        .ThenInclude(p => p.Product).ThenInclude(p => p.Tags)
                .Where(od => od.Order.CustomerId == userId)
                .ToListAsync();
        }
        
        public async Task<List<OrderDetail>> GetAllOrderDetailsAsync()
        {
            return await _context.OrderDetails
                .Include(od => od.ProductVariant)
                .ThenInclude(pv => pv.ProductColor)
                .ThenInclude(p => p.Product).ThenInclude(p => p.Tags)
                .ToListAsync();
        }
    }
}
