using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ITryOnSlotService
    {
        Task<TryOnResponse> CreateTryOnSlot(CreateTryOnRequest createTryOnRequest);
        Task<TryOnSlot> FindExistingTryOnSlot(string userModelImageHash, string? topProductColorId, string? bottomProductColorId);
        Task<bool> UpdateOutputImageUrl(UpdateTryOnRequest updateTryOnRequest);
        Task<TryOnResponse?> GetTryOnSlotByIdAsync(int tryOnSlotId);
        Task<string> CheckImageModelIsValid(ImageModel imageModel);
        Task<Pagination<TryOnResponse>> GetHistoryTryOn(PaginationParameter paginationParameter);
        Task<TryOnResponse> GetDetailTryOnSlot(int tryOnSlotId);
    }
}
