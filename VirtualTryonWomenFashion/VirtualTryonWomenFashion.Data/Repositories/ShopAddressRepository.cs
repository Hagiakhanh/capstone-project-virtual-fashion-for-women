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
    public class ShopAddressRepository : GenericRepository<ShopAddress>, IShopAddressRepository
    {
        public ShopAddressRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<ShopAddress> GetShopAddress()
        {
            return await _context.ShopAddresses.FirstOrDefaultAsync();
        }
    }
}
