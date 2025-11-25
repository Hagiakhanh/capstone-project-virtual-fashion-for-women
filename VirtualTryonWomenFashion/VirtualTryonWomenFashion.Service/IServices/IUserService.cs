using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IUserService
    {
        public Task<MessageModel> RegisterCustomerAccount(RequestCreateAccount requestCreateAccount);
        public Task<MessageModelWithData<string>> LoginAccount(RequestLoginAccount requestLoginAccount);
        public Task<MessageModel> ConfirmAccount(RequestConfirmAccount requestConfirmAccount);
        public Task<UserInformation> GetUserInformationAsync();
        public Task<UserInformation> UpdateUserInformationAsync(int userId, RequestUpdateUser requestUpdateUser);
        public Task<MessageModel> LogoutUser(string token, TimeSpan expiryTime);
        public Task<bool> IsBlacklistedAsync(string token);
        public Task<List<User>> GetAllStaff();
        public Task<MessageModel> CreateStaffAccount(RequestCreateAccount requestCreateAccount);
        public Task<Pagination<ResponseStaffInformation>> GetAllStaffForAdmin(PaginationParameter page, bool? isActive);
        public Task<MessageModel> UpdateStatusStaffForAdmin(int staffId);
        public Task<MessageModelWithData<string>> LoginByGoogle(RequestLoginGoogle requestLoginGoogle);
    }
}
