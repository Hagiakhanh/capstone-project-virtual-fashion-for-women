using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.SuggestedOutfit;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ISuggestedOutfitService
    {
        public Task<ResponsePaginationModel<List<ResponseSuggestedOutfitModel>>> GetSuggestedOutfitsAsync(PaginationParameter paginationParameter, int? AIConversationID);
        public Task<SuggestedOutfit> CreateSuggestedOutfit(SuggestedOutfit suggestedOutfit);
    }
}
