using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IRatingRepository : IGenericRepository<Rating>
    {
        Task<Rating?> GetRatingByIdAsync(int ratingId);
        Task<Rating?> GetCustomerRatingInProductAsync(string productId, int userId);
        Task<List<Rating>> GetAllProductRatingsAsync(string productId);
    }
}
