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

        public async Task<TryOnSlot?> GetExistingTryOnSlotAsync(int userId,string userModelImageHash, string? topProductColorId, string? bottomProductColorId)
        {
            var productColorIds = new List<string> {topProductColorId, bottomProductColorId};
            var tryOnSlot =  await _context.TryOnSlots
                .AsNoTracking()
                .Where(slot =>slot.CustomerId == userId && slot.UploadImageBinary == userModelImageHash &&  slot.ProductColors
                    .Any(pc => productColorIds.Contains(pc.ProductColorId)))
                .Include(to => to.ProductColors).FirstOrDefaultAsync();
            return tryOnSlot ??= null;
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
                .Where(slot => slot.CustomerId == userId && slot.UploadImageBinary == userModelImageHash)
                .Include(to => to.ProductColors).FirstOrDefaultAsync();
            return tryOnSlot != null;
        }
    }
}
