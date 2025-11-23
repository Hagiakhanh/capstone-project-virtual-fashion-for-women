using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface ISuggestedOutfitRepository : IGenericRepository<SuggestedOutfit>
    {
        public Task<bool> CreateSuggestedOutfit(SuggestedOutfit requestModel);
        Task<int> GetTotalSuggestedItemsAsync();
        Task<List<TopSuggestedProductDto>> GetTopSuggestedProductsAsync(
            DateTime start,
            DateTime end,
            int top);
    }

}
