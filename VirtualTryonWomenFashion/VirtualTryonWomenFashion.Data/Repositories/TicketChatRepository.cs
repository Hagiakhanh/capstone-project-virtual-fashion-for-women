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
    public class TicketChatRepository : GenericRepository<TicketChat>, ITicketChatRepository
    {
        public TicketChatRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<TicketChat> GetTicketChatBySlug(string slug)
        {
            return await _context.TicketChats.Include(x => x.Messages)
                .FirstOrDefaultAsync(x => x.Slug == slug);
        }
    }
}