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
    public class AiconversationRepository : GenericRepository<Aiconversation>, IAiconversationRepository
    {
        public AiconversationRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<int> GetTotalConversationsAsync()
        {
            return await _context.Aiconversations
                .Where(x => !x.IsDeleted)  // nếu bạn muốn bỏ cuộc trò chuyện đã xóa
                .CountAsync();
        }

        public async Task<int> GetTotalUsersUsedAIAsync()
        {
            return await _context.Aiconversations
                .Where(x => !x.IsDeleted)
                .Select(x => x.UserId)
                .Distinct()
                .CountAsync();
        }

        public async Task<List<AiConversationChartDto>> GetConversationChartAsync(DateTime startDate, DateTime endDate)
        {
            var rangeHours = (endDate - startDate).TotalHours;

            if (rangeHours > 24)
            {
                var data = await _context.Aiconversations
                    .Where(x => !x.IsDeleted &&
                                x.CreatedAt >= startDate &&
                                x.CreatedAt <= endDate)
                    .GroupBy(x => x.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Date)
                    .ToListAsync();

                // Format label sau khi đã lấy ra khỏi SQL
                return data.Select(x => new AiConversationChartDto
                {
                    Label = x.Date.ToString("dd/MM"),
                    Count = x.Count
                }).ToList();
            }

            // --- Group theo 4 giờ ---
            var data4h = await _context.Aiconversations
                .Where(x => !x.IsDeleted &&
                            x.CreatedAt >= startDate &&
                            x.CreatedAt <= endDate)
                .GroupBy(x => x.CreatedAt.Hour / 4) // integer block
                .Select(g => new
                {
                    Block = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Block)
                .ToListAsync();

            return data4h.Select(x => new AiConversationChartDto
            {
                Label = $"{x.Block * 4:00}:00 - {x.Block * 4 + 4:00}:00",
                Count = x.Count
            }).ToList();
        }

    }

    public class AiConversationChartDto
    {
        public string Label { get; set; }
        public int Count { get; set; }
    }

}
