using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IUserService
    {
        public Task<MessageModel> RegisterCustomerAccount(RequestCreateAccount requestCreateAccount);
        public Task<MessageModelWithData<string>> LoginAccount(RequestLoginAccount requestLoginAccount);
        public Task<MessageModel> ConfirmAccount(RequestConfirmAccount requestConfirmAccount);
        
        public Task<UserInformation> GetUserInformationByIdAsync(int userId);
    }
}
