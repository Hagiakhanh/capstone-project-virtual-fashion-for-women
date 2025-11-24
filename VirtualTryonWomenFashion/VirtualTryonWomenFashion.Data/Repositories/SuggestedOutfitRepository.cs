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
    public class SuggestedOutfitRepository : GenericRepository<SuggestedOutfit>, ISuggestedOutfitRepository
    {
        public SuggestedOutfitRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<bool> CreateSuggestedOutfit(SuggestedOutfit requestModel)
        {
            try
            {
                // Lấy context hiện tại (giả sử repository có _context)
                var dateNow = DateTime.UtcNow.AddHours(7);

                // Tạo đối tượng SuggestedOutfit mới
                var newOutfit = new SuggestedOutfit
                {
                    AiconversationId = requestModel.AiconversationId,
                    UserStyleJson = requestModel.UserStyleJson,
                    CreatedAt = dateNow,
                    IsDeleted = false
                };

                if (requestModel.ProductVariants != null && requestModel.ProductVariants.Any())
                {
                    foreach (var pv in requestModel.ProductVariants)
                    {
                        _context.Attach(pv);
                        newOutfit.ProductVariants.Add(pv);
                    }
                }

                await _context.SuggestedOutfits.AddAsync(newOutfit);

                // Lưu thay đổi
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating SuggestedOutfit: {ex.Message}");
                return false;
            }
        }

        public async Task<int> GetTotalSuggestedItemsAsync()
        {
            return await _context.SuggestedOutfits
                .Where(x => !x.IsDeleted)
                .SelectMany(x => x.ProductVariants)
                .CountAsync();
        }

        public async Task<List<TopSuggestedProductDto>> GetTopSuggestedProductsAsync(
            DateTime start,
            DateTime end,
            int top)
        {
            var query = _context.SuggestedOutfits
                .Where(x => !x.IsDeleted &&
                            x.CreatedAt >= start &&
                            x.CreatedAt <= end)
                .SelectMany(x => x.ProductVariants)
                .Where(pv => pv.ProductColor.Product != null)
                .GroupBy(pv => pv.ProductColor.ProductId)
                .Select(g => new TopSuggestedProductDto
                {
                    ProductId = g.Key,
                    SuggestCount = g.Count()
                })
                .OrderByDescending(x => x.SuggestCount)
                .Take(top);

            return await query.ToListAsync();
        }

    }

    public class TopSuggestedProductDto
    {
        public string ProductId { get; set; }
        public int SuggestCount { get; set; }
    }

}
