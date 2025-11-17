using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Size;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ISizeService
    {
        public Task<List<Size>> GetAllAsync();
        public Task<MessageModelWithData<Size>> CreateAsync(RequestCreateSizeModel sizeModel);
        Task<MessageModelWithData<Size>> UpdateAsync(int sizeId, RequestCreateSizeModel sizeModel);
        Task<Size> GetByidAsync(int id);
        Task<MessageModel> DeleteSize(int sizeId);

    }
}
