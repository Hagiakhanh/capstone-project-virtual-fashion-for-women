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
    public class UserInteractionRepository : GenericRepository<UserInteraction>, IUserInteractionRepository
    {
        public UserInteractionRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<UserInteraction>> GetInteractionByUserIdAsync(int userId)
        {
            return await _context.UserInteractions
                .Include(ui => ui.Product)
                    .ThenInclude(p =>p.Tags)
                .Where(ui => ui.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<UserInteraction>> GetInteractionByProductIdAsync(string productId)
        {
            return await _context.UserInteractions
                .Include(ui => ui.Product)
                .Include(ui => ui.User)
                .Where(ui => ui.ProductId == productId)
                .ToListAsync();
        }
        
        public async Task<List<UserInteraction>> GetAllInteractionsAsync()
        {
            return await _context.UserInteractions
                .Include(ui => ui.Product)
                .Include(ui => ui.User)
                .ToListAsync();
        }
    }
}
