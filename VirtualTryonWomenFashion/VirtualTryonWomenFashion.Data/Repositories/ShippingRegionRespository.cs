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
    public class ShippingRegionRespository : GenericRepository<ShippingRegion>, IShippingRegionRespository
    {
        public ShippingRegionRespository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<ShippingRegion>> GetShippingRegion()
        {
            return await _context.ShippingRegions.ToListAsync();
        }
    }
}
