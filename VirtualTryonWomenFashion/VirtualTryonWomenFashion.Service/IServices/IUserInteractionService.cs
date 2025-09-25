using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IUserInteractionService
    {
        Task<MessageModelWithData<UserInteraction>> CreateAsync(CreateUpdateUserInteractionDto request);
        Task<MessageModelWithData<UserInteraction>> UpdateAsync(int id, CreateUpdateUserInteractionDto interaction);
        Task<MessageModel> DeleteAsync(int id);
        Task<UserInteraction> GetByIdAsync(int id);
        Task<List<UserInteraction>> GetUserInteractionByUserIdAsync();
        Task<List<UserInteraction>> GetUserInteractionByProductIdAsync(string productId);
    }
}
