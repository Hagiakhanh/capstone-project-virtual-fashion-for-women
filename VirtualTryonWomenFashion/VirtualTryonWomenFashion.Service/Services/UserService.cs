using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Mail;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;
using VirtualTryonWomenFashion.Service.Utils;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IMailService _mailService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ICurrentUserService _currentUserService;
        private readonly IRedisCacheService _redisCacheService;

        public UserService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IMailService mailService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ICurrentUserService currentUserService,
            IRedisCacheService redisCacheService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mailService = mailService;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _currentUserService = currentUserService;
            _redisCacheService = redisCacheService;
        }

        public async Task<MessageModel> ConfirmAccount(RequestConfirmAccount requestConfirmAccount)
        {
            User user = await _userRepository.GetUserByEmail(requestConfirmAccount.Email);
            if (user == null)
            {
                throw new Exception("Invalid email");
            }
            if (string.IsNullOrEmpty(user.EmailConfirmToken))
            {
                throw new Exception("This account already confirm");
            }
            if (user.EmailConfirmToken != requestConfirmAccount.ConfirmToken)
            {
                throw new Exception("Invalid confirm token");
            }

            user.IsEmailConfirm = true;
            user.EmailConfirmToken = string.Empty;
            await _userRepository.UpdateAsync(user);
            int result = await _unitOfWork.SaveChanges();

            if (result > 0)
            {
                return new MessageModel
                {
                    Message = "Confirm account successful",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = "Confirm account fail",
                StatusCode = StatusCodes.Status400BadRequest
            };

        }


        public async Task<MessageModelWithData<string>> LoginAccount(RequestLoginAccount requestLoginAccount)
        {
            User user = await _userRepository.GetUserByEmail(requestLoginAccount.Email);
            if (user == null || !PasswordUtils.VerifyPassword(requestLoginAccount.Password, user.Password))
            {
                throw new Exception("Incorrect email or password");
            }
            if (user.IsActive == false)
            {
                throw new Exception("Inactive account");
            }
            if (user.IsEmailConfirm == false)
            {
                throw new Exception("Please confirm your email");
            }

            string accessToken = GenerateAccessToken(user);
            return new MessageModelWithData<string>
            {
                Message = "Login successful",
                StatusCode = StatusCodes.Status200OK,
                Data = accessToken
            };

        }

        public async Task<MessageModel> RegisterCustomerAccount(RequestCreateAccount requestCreateAccount)
        {
            User checkUser = await _userRepository.GetUserByEmail(requestCreateAccount.Email);
            if (checkUser != null)
            {
                throw new Exception("Email already in use");
            }

            if (requestCreateAccount.Password != requestCreateAccount.ConfirmPassword)
            {
                throw new Exception("Password and confirm password not the same");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                Role customerRole = await _roleRepository.GetRoleByRoleName("Customer");
                User newUser = new User
                {
                    RoleId = customerRole.RoleId,
                    FullName = requestCreateAccount.FullName,
                    Email = requestCreateAccount.Email,
                    Password = PasswordUtils.HashPassword(requestCreateAccount.Password),
                    IsActive = true,
                    IsEmailConfirm = false,
                    CreatedDate = DateTime.UtcNow.AddHours(7),
                    EmailConfirmToken = Guid.NewGuid().ToString(),
                };

                await _userRepository.InsertAsync(newUser);

                //Gọi service để gửi email
                await _mailService.sendEmailAsync(new MailRequest
                {
                    ToEmail = newUser.Email,
                    Subject = "[Women Fashion] Xác nhận tài khoản",
                    Body = MailContent.ConfirmAccountEmail(newUser.FullName, newUser.EmailConfirmToken, newUser.Email)
                });

                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Confirm your email",
                        StatusCode = StatusCodes.Status200OK
                    };
                }
                return new MessageModel
                {
                    Message = "Create new account fail",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

        }

        public string GenerateAccessToken(User user)
        {
            var claimList = new List<Claim>
            {
                new Claim(ClaimTypes.Role, user.Role.RoleId.ToString()),
                new Claim("UserID", user.UserId.ToString()),
                new Claim("role", user.Role.RoleId)
            };
            var accessToken = GenerateJwtToken.AccessToken(claimList, _configuration);
            return new JwtSecurityTokenHandler().WriteToken(accessToken);
        }

        public async Task<UserInformation> GetUserInformationAsync()
        {
            int userId = _currentUserService.GetUserId();
            User user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User không tồn tại");
            }

            return user.MapToUserInformation();
        }

        public async Task<UserInformation> UpdateUserInformationAsync(int userId, RequestUpdateUser requestUpdateUser)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                if (userId != currentUserId)
                {
                    throw new Exception("Bạn không có quyền thay đổi thông tin user này");
                }

                User user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    throw new Exception("User không tồn tại");
                }

                user.Address = requestUpdateUser.Address;
                user.PhoneNumber = requestUpdateUser.PhoneNumber;
                user.FullName = requestUpdateUser.FullName;
                await _userRepository.UpdateAsync(user);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return user.MapToUserInformation();
            }catch(Exception ex)
            {
                throw ex;
            }
        }

        public async Task<MessageModel> LogoutUser(string token, TimeSpan expiryTime)
        {
            var key = $"Blacklist_{token}";
            await _redisCacheService.SetData(key, "revoked", expiryTime);
            return new MessageModel
            {
                Message = "Đăng xuất thành công",
                StatusCode = StatusCodes.Status200OK
            };
        }

        public async Task<bool> IsBlacklistedAsync(string token)
        {
            var key = $"Blacklist_{token}";
            var data = await _redisCacheService.GetData<string>(key);
            if (data == null)
            {
                return false;
            }
            return true;
        }

        public async Task<List<User>> GetAllStaff()
        {
            Role customerRole = await _roleRepository.GetRoleByRoleName("Staff");
            List<User> staffUser = await _userRepository.GetAll(
                filter: x => x.RoleId == customerRole.RoleId
                );
            return staffUser ??= new List<User>();
        }
    }
}
