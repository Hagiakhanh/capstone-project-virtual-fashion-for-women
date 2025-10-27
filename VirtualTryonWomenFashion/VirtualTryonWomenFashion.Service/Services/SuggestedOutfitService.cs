using AutoMapper;
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
using VirtualTryonWomenFashion.Service.DTO.SuggestedOutfit;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class SuggestedOutfitService : ISuggestedOutfitService
    {
        private readonly ISuggestedOutfitRepository _suggestedOutfitRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly IAiconversationRepository _aiconversationRepository;
        public SuggestedOutfitService(ISuggestedOutfitRepository suggestedOutfitRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper,
            IAiconversationRepository aiconversationRepository)
        {
            _suggestedOutfitRepository = suggestedOutfitRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _aiconversationRepository = aiconversationRepository;
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

        public async Task<Pagination<ResponseSuggestedOutfitModel>> GetSuggestedOutfitsAsync(PaginationParameter paginationParameter, int? AIConversationID)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                Aiconversation getDetailConversation = await _aiconversationRepository.GetByIdAsync(AIConversationID);
                if (getDetailConversation == null)
                {
                    throw new ArgumentException("Cuộc trò chuyện không hợp lệ");
                }
                if (getDetailConversation.UserId != currentUserId)
                {
                    throw new ArgumentException("Bạn không có quyền đến cuộc trò chuyện này");
                }

                int totalRecords = _suggestedOutfitRepository.Count(x => x.IsDeleted == false
                && (!AIConversationID.HasValue || x.AiconversationId == AIConversationID));
                List<SuggestedOutfit> suggestedOutfits = await _suggestedOutfitRepository.GetAll(paginationParameter, x => x.IsDeleted == false
                && (!AIConversationID.HasValue || x.AiconversationId == AIConversationID),
                    x => x.OrderByDescending(x => x.CreatedAt), x => x.ProductVariants);

                List<ResponseSuggestedOutfitModel> listResponse = _mapper.Map<List<ResponseSuggestedOutfitModel>>(suggestedOutfits);

                return new Pagination<ResponseSuggestedOutfitModel>(listResponse, totalRecords, paginationParameter.PageIndex, paginationParameter.PageSize);
            }
            catch (ArgumentException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                return new Pagination<ResponseSuggestedOutfitModel>([], 0, paginationParameter.PageIndex, paginationParameter.PageSize);
            }
        }
    }
}
