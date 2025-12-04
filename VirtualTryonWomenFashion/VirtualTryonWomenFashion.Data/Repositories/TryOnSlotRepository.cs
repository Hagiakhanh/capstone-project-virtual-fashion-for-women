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
    public class TryOnSlotRepository : GenericRepository<TryOnSlot>, ITryOnSlotRepository
    {
        public TryOnSlotRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<TryOnSlot?> GetExistingTryOnSlotAsync(
    int userId,
    string userModelImageHash,
    string? topProductColorId,
    string? bottomProductColorId)
        {
            var requestedProductColorIds = new List<string?> { topProductColorId, bottomProductColorId }
                .Where(id => !string.IsNullOrEmpty(id))
                .OrderBy(id => id)
                .ToList();

            // Nếu không có product color nào thì return null
            if (!requestedProductColorIds.Any())
                return null;

            var tryOnSlotList = await _context.TryOnSlots
                .AsNoTracking()
                .Where(slot => slot.CustomerId == userId &&
                               slot.UploadImageHash == userModelImageHash)
                .Include(to => to.ProductColors)
                .ToListAsync();

            // Tìm slot có CHÍNH XÁC cùng tập hợp product colors
            var tryOnSlot = tryOnSlotList.FirstOrDefault(slot =>
            {
                var slotProductColorIds = slot.ProductColors
                    .Select(pc => pc.ProductColorId)
                    .OrderBy(id => id)
                    .ToList();

                // Phải cùng số lượng VÀ cùng các product colors
                return slotProductColorIds.Count == requestedProductColorIds.Count &&
                       slotProductColorIds.SequenceEqual(requestedProductColorIds);
            });

            return tryOnSlot;
        }

        public async Task<TryOnSlot?> GetTryOnSlotById(int tryOnSlotId)
        {
            var tryonSlotDetail = await _context.TryOnSlots
                .AsNoTracking()
                .Where(to=>to.TryOnSlotId == tryOnSlotId)
                .Include(to=>to.ProductColors)
                .FirstOrDefaultAsync();
            return tryonSlotDetail ??= null;
        }

        public async Task<bool> HasImageModelHash(int userId, string userModelImageHash)
        {
            var tryOnSlot = await _context.TryOnSlots
                .AsNoTracking()
                .Where(slot => slot.CustomerId == userId && slot.UploadImageHash == userModelImageHash)
                .Include(to => to.ProductColors).FirstOrDefaultAsync();
            return tryOnSlot != null;
        }

        public async Task<List<TopTryOnProductDto>> GetTopTryOnProductsAsync(
            DateTime start, DateTime end, int limit)
        {
            var query =
                from slot in _context.TryOnSlots
                where slot.CreatedAt >= start
                   && slot.CreatedAt <= end
                   && !slot.IsDeleted
                from pc in slot.ProductColors
                let product = pc.Product
                select new
                {
                    product.ProductId,
                    product.ProductName,
                    product.MainImageUrl
                };

            var result = await query
                .GroupBy(x => new { x.ProductId, x.ProductName, x.MainImageUrl })
                .Select(g => new TopTryOnProductDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    MainImageUrl = g.Key.MainImageUrl,
                    TotalTryOn = g.Count() // COUNT EVERY ROW
                })
                .OrderByDescending(x => x.TotalTryOn)
                .Take(limit)
                .ToListAsync();

            return result;
        }

        public async Task<List<TryOnChartPointDto>> GetTryOnTimelineAsync(
            string productId, DateTime start, DateTime end)
        {
            var totalHours = (end - start).TotalHours;

            var query =
                from slot in _context.TryOnSlots
                where slot.CreatedAt >= start
                   && slot.CreatedAt <= end
                   && !slot.IsDeleted
                from pc in slot.ProductColors
                where pc.ProductId == productId
                select slot.CreatedAt;

            // ================= CASE 1: <= 24h =====================
            if (totalHours <= 24)
            {
                var grouped = await query
                    .Select(dt => new
                    {
                        dt.Year,
                        dt.Month,
                        dt.Day,
                        Block = dt.Hour / 2   // block 2 giờ
                    })
                    .GroupBy(x => new { x.Year, x.Month, x.Day, x.Block })
                    .Select(g => new
                    {
                        g.Key.Year,
                        g.Key.Month,
                        g.Key.Day,
                        g.Key.Block,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.Month)
                    .ThenBy(x => x.Day)
                    .ThenBy(x => x.Block)
                    .ToListAsync();

                return grouped.Select(g => new TryOnChartPointDto
                {
                    Time = new DateTime(g.Year, g.Month, g.Day)
                                .AddHours(g.Block * 2),
                    Count = g.Count
                }).ToList();
            }

            // ================= CASE 2: > 24h — group theo ngày =====================
            var groupedDays = await query
                .Select(dt => new
                {
                    dt.Year,
                    dt.Month,
                    dt.Day
                })
                .GroupBy(x => new { x.Year, x.Month, x.Day })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    g.Key.Day,
                    Count = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ThenBy(x => x.Day)
                .ToListAsync();

            return groupedDays.Select(g => new TryOnChartPointDto
            {
                Time = new DateTime(g.Year, g.Month, g.Day),
                Count = g.Count
            }).ToList();
        }

    }

    public class TopTryOnProductDto
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public string MainImageUrl { get; set; }
        public int TotalTryOn { get; set; }
    }

    public class TryOnChartPointDto
    {
        public DateTime Time { get; set; }
        public int Count { get; set; }
    }

}
