using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class RatingRepository : GenericRepository<Rating>, IRatingRepository
    {
        public RatingRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<Rating?> GetRatingByIdAsync(int ratingId)
        {
            return await _context.Ratings
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ProductVariant)
                .FirstOrDefaultAsync(r => r.RatingId == ratingId);
        }
        
        public async Task<Rating?> GetRatingByOrderDetailIdAsync(int orderDetailId, int userId)
        {
            return await _context.Ratings
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ProductVariant)
                .FirstOrDefaultAsync(r => r.OrderDetailId == orderDetailId && r.UserId == userId);
        }

        public async Task<Rating?> GetCustomerRatingInProductAsync(string productId, int userId)
        {
            return await _context.Ratings
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(v => v.ProductColor)
                .FirstOrDefaultAsync(r => r.OrderDetail.ProductVariant.ProductColor.ProductId == productId && r.UserId == userId);
        }

        public async Task<List<Rating>> GetAllProductRatingsAsync(string productId)
        {
            return await _context.Ratings
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(v => v.ProductColor)
                .Include(r => r.User)
                .Where(r => r.OrderDetail.ProductVariant.ProductColor.ProductId == productId)
                .ToListAsync();
        }
    }
}
