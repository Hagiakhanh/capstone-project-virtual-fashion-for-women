using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface ITryOnSlotRepository : IGenericRepository<TryOnSlot>
    {
        Task<TryOnSlot?> GetExistingTryOnSlotAsync(int userId,string userModelImageHash, string? topProductColorId, string? bottomProductColorId);
        Task<bool> HasImageModelHash(int userId, string userModelImageHash);
        Task<TryOnSlot?> GetTryOnSlotById(int tryOnSlotId);
        Task<List<TopTryOnProductDto>> GetTopTryOnProductsAsync(
            DateTime start, DateTime end, int limit);
        Task<List<TryOnChartPointDto>> GetTryOnTimelineAsync(
            string productId, DateTime start, DateTime end);
    }
}
