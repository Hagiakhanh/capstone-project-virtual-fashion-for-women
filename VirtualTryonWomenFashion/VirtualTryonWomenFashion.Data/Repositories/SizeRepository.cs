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
    public class SizeRepository : GenericRepository<Size>, ISizeRepository
    {
        public SizeRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<Size> GetSizeById(int id)
        {
            return await _context.Sizes.Include(s => s.ProductVariants)
                .Where(s => s.SizeId == id).FirstOrDefaultAsync();
        }
    }
}
