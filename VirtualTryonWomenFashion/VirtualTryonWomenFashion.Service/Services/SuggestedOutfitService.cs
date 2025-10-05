using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class SuggestedOutfitService : ISuggestedOutfitService
    {
        private readonly ISuggestedOutfitRepository _suggestedOutfitRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        public SuggestedOutfitService(ISuggestedOutfitRepository suggestedOutfitRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _suggestedOutfitRepository = suggestedOutfitRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }
        public async Task<SuggestedOutfit> CreateSuggestedOutfit(SuggestedOutfit suggestedOutfit)
        {
            try
            {
                await _suggestedOutfitRepository.InsertAsync(suggestedOutfit);
                await _unitOfWork.SaveChanges();
                return suggestedOutfit;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<Pagination<SuggestedOutfit>> GetSuggestedOutfitsAsync(PaginationParameter paginationParameter, int? AIConversationID)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                int totalRecords = _suggestedOutfitRepository.Count(x => x.IsDeleted == false
                && (!AIConversationID.HasValue || x.AiconversationId == AIConversationID) && x.Aiconversation.UserId == currentUserId);
                List<SuggestedOutfit> suggestedOutfits = await _suggestedOutfitRepository.GetAll(paginationParameter, x => x.IsDeleted == false
                && (!AIConversationID.HasValue || x.AiconversationId == AIConversationID) && x.Aiconversation.UserId == currentUserId,
                    x => x.OrderByDescending(x => x.CreatedAt), x => x.Aiconversation);
                return new Pagination<SuggestedOutfit>(suggestedOutfits, totalRecords, paginationParameter.PageIndex, paginationParameter.PageSize);
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
