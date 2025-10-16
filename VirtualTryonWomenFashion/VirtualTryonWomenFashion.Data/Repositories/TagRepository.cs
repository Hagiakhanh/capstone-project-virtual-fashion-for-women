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
    public class TagRepository : GenericRepository<Tag>, ITagRepository
    {
        public TagRepository(VirtualTryonWomenFashionContext context) : base(context) 
        { }

        public async Task<List<Tag>> GetTagsByProductIdAsync(string productId)
        {
            return await _context.Products
                .Where(p => p.ProductId == productId)
                .SelectMany(p => p.Tags)
                .ToListAsync();
        }

    }
}
