using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ISuggestedOutfitService
    {
        public Task<Pagination<SuggestedOutfit>> GetSuggestedOutfitsAsync(PaginationParameter paginationParameter, int? AIConversationID);
        public Task<SuggestedOutfit> CreateSuggestedOutfit(SuggestedOutfit suggestedOutfit);
    }
}
