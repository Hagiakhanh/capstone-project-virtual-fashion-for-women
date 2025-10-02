using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IWishlistRepository : IGenericRepository<Wishlist>
    {
        Task<List<string>> GetUserWishlistProductIdsAsync(int userId);
    }
}
