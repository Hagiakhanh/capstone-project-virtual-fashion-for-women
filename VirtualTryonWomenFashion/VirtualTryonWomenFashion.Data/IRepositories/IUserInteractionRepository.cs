using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IUserInteractionRepository : IGenericRepository<UserInteraction>
    {
        Task<List<UserInteraction>> GetInteractionByUserIdAsync(int userId);
        Task<List<UserInteraction>> GetInteractionByProductIdAsync(string productId);
        Task<List<UserInteraction>> GetAllInteractionsAsync();
    }
}
