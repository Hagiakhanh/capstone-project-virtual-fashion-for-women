using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.User;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public static class UserMapper
    {
        public static UserInformation MapToUserInformation(this User user)
        {
            return new UserInformation() {
                UserId = user.UserId,
                Address = user.Address,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber
            };
        }
    }
}
