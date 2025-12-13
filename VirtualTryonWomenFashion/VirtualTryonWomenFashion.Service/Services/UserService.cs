using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
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
        private readonly IWalletService _walletService;
        private readonly string _baseUrl;

        public UserService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IMailService mailService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ICurrentUserService currentUserService,
            IRedisCacheService redisCacheService,
            IWalletService walletService
            )
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mailService = mailService;
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _currentUserService = currentUserService;
            _redisCacheService = redisCacheService;
            _walletService = walletService;
            _baseUrl = configuration["Frontend:Production"];
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
                Wallet userWallet = await _walletService.CreateWalletAsync();
                Role customerRole = await _roleRepository.GetRoleByRoleName("Customer");
                User newUser = new User
                {
                    RoleId = customerRole.RoleId,
                    WalletId = userWallet.WalletId,
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
                _mailService.sendEmailAsync(new MailRequest
                {
                    ToEmail = newUser.Email,
                    Subject = "[Women Fashion] Xác nhận tài khoản",
                    Body = MailContent.ConfirmAccountEmail(newUser.FullName, newUser.EmailConfirmToken, newUser.Email, _baseUrl)
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
                new Claim("role", user.Role.RoleId),
                new Claim("email", user.Email),
                new Claim("name", user.FullName),
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
                user.SecondAddress = requestUpdateUser.SecondAddress;
                await _userRepository.UpdateAsync(user);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return user.MapToUserInformation();
            }
            catch (Exception ex)
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

        public async Task<MessageModel> CreateStaffAccount(RequestCreateAccount requestCreateAccount)
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

            Role staffRole = await _roleRepository.GetRoleByRoleName("Staff");
            User newStaff = new User
            {
                RoleId = staffRole.RoleId,
                FullName = requestCreateAccount.FullName,
                Email = requestCreateAccount.Email,
                Password = PasswordUtils.HashPassword(requestCreateAccount.Password),
                IsActive = true,
                IsEmailConfirm = true,
                CreatedDate = DateTime.UtcNow.AddHours(7),
            };

            await _userRepository.InsertAsync(newStaff);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = "Tạo tài khoản nhân viên thành công",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = "Tạo tài khoản nhân viên thất bại",
                StatusCode = StatusCodes.Status400BadRequest
            };

        }

        public async Task<Pagination<ResponseStaffInformation>> GetAllStaffForAdmin(PaginationParameter page, bool? isActive)
        {
            Role staffRole = await _roleRepository.GetRoleByRoleName("Staff");

            Expression<Func<User, bool>> filter = user =>
                                                    user.RoleId == staffRole.RoleId &&
                                                    (!isActive.HasValue || user.IsActive == isActive.Value);

            List<User> staffUsers = await _userRepository.GetAll(
                                        pagination: page,
                                        filter: filter,
                                        includes: x => x.Role
                                    );
            int staffCount = await _userRepository.CountAsync(filter: filter);

            List<ResponseStaffInformation> staffList = staffUsers.Select(staff => new ResponseStaffInformation
            {
                UserId = staff.UserId,
                FullName = staff.FullName,
                Email = staff.Email,
                RoleName = staff.Role.RoleDescVn,
                IsActive = staff.IsActive.Value,
            }).ToList();

            Pagination<ResponseStaffInformation> result = new Pagination<ResponseStaffInformation>(staffList ?? new List<ResponseStaffInformation>(), staffCount, page.PageIndex, page.PageSize);

            return result;
        }

        public async Task<MessageModel> UpdateStatusStaffForAdmin(int staffId)
        {
            User staff = await _userRepository.GetUserById(staffId);
            if (staff == null)
            {
                throw new Exception("Tài khoản không tồn tại");
            }
            if (staff.Role.RoleId != "Staff")
            {
                throw new Exception($"Tài khoản hiện tại có role là {staff.Role.RoleDescVn}, không thay đổi");
            }
            bool currentStatus = staff.IsActive.Value;

            staff.IsActive = !currentStatus;

            await _userRepository.UpdateAsync(staff);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = $"Thay đổi trạng thái thành công từ {currentStatus} sang {staff.IsActive}",
                    StatusCode = StatusCodes.Status200OK,
                };
            }

            return new MessageModel
            {
                Message = $"Thay đổi trạng thái Không thành công",
                StatusCode = StatusCodes.Status500InternalServerError,
            };

        }

        public async Task<MessageModelWithData<string>> LoginByGoogle(RequestLoginGoogle requestLoginGoogle)
        {
            await _unitOfWork.BeginTransactionAsync();
            string clientId = _configuration["GoogleCredential:ClientId"];
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string> { clientId }
            };
            var payload = await GoogleJsonWebSignature.ValidateAsync(requestLoginGoogle.credential, settings);

            if (payload == null)
            {
                throw new Exception("Credential không hợp lệ");
            }

            User existUser = await _userRepository.GetUserByEmail(payload.Email);
            //Nếu đã tồn tại user trong hệ thống 
            if (existUser != null)
            {
                if (existUser.IsActive == false)
                {
                    throw new Exception("Tài khoản bị vô hiệu hóa");
                }
                var accessToken = GenerateAccessToken(existUser);
                return new MessageModelWithData<string>
                {
                    Message = "Đăng nhập thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = accessToken
                };
            }
            else
            {
                // Nếu chưa tồn tại user
                try
                {
                    Wallet userWallet = await _walletService.CreateWalletAsync();
                    Role customerRole = await _roleRepository.GetRoleByRoleName("Customer");
                    User newUser = new User
                    {
                        RoleId = customerRole.RoleId,
                        WalletId = userWallet.WalletId,
                        FullName = payload.Name,
                        Email = payload.Email,
                        Password = "",
                        IsActive = true,
                        IsEmailConfirm = true,
                        CreatedDate = DateTime.UtcNow.AddHours(7),
                    };

                    await _userRepository.InsertAsync(newUser);
                    int result = await _unitOfWork.SaveChanges();
                    if (result > 0)
                    {
                        await _unitOfWork.CommitTransactionAsync();
                        var accessToken = GenerateAccessToken(newUser);
                        return new MessageModelWithData<string>
                        {
                            Message = "Tạo tài khoản thành công",
                            StatusCode = StatusCodes.Status200OK,
                            Data = accessToken
                        };
                    }

                    return new MessageModelWithData<string>
                    {
                        Message = "Đăng nhập google thất bại",
                        StatusCode = StatusCodes.Status500InternalServerError,
                    };
                }
                catch (Exception ex)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw;
                }
            }

        }

        public async Task<MessageModel> CreateForgotPassword(RequestForgotPassword requestForgotPassword)
        {
            User user = await _userRepository.GetUserByEmail(requestForgotPassword.Email);
            if (user == null)
            {
                throw new Exception("Tài khoản không tồn tại");
            }
            if (user.IsActive == false)
            {
                throw new Exception("Tài khoản bị vô hiệu hóa");
            }
            if (user.IsEmailConfirm == false)
            {
                throw new Exception("Tài khoản chưa được kích hoạt");
            }

            user.ResetToken = Guid.NewGuid().ToString();
            await _userRepository.UpdateAsync(user);

            //Gọi service để gửi email
            _mailService.sendEmailAsync(new MailRequest
            {
                ToEmail = user.Email,
                Subject = "[Women Fashion] Quên mật khẩu",
                Body = MailContent.ResetPasswordEmail(user.FullName, user.ResetToken, user.Email, _baseUrl)
            });

            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = "Tạo yêu cầu quên mật khẩu",
                    StatusCode = StatusCodes.Status200OK
                };
            }

            return new MessageModel
            {
                Message = "Tạo yêu cầu quên mật khẩu thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };


        }

        public async Task<MessageModel> CreateNewPassword(RequestCreateNewPassword requestCreateNewPassword)
        {
            User user = await _userRepository.GetUserByEmail(requestCreateNewPassword.Email);
            if (user == null)
            {
                throw new Exception("Tài khoản không tồn tại");
            }
            if (user.IsActive == false)
            {
                throw new Exception("Tài khoản bị vô hiệu hóa");
            }
            if (user.IsEmailConfirm == false)
            {
                throw new Exception("Tài khoản chưa được kích hoạt");
            }
            if (string.IsNullOrEmpty(user.ResetToken))
            {
                throw new Exception("Không thể đổi mật khẩu");
            }
            if (user.ResetToken != requestCreateNewPassword.ResetToken)
            {
                throw new Exception("Token không hợp lệ");
            }
            if (requestCreateNewPassword.Password != requestCreateNewPassword.ConfirmPassword)
            {
                throw new Exception("Xác nhận mật khẩu không khớp");
            }

            user.Password = PasswordUtils.HashPassword(requestCreateNewPassword.Password);
            user.ResetToken = null;
            await _userRepository.UpdateAsync(user);
            int result = await _unitOfWork.SaveChanges();

            if (result > 0)
            {
                return new MessageModel
                {
                    Message = "Đổi mật khẩu thành công",
                    StatusCode = StatusCodes.Status200OK,
                };
            }

            return new MessageModel
            {
                Message = "Đổi mật khẩu thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };

        }

        public async Task<User> GetUserById(int userId)
        {
            User user = await _userRepository.GetUserById(userId);
            if (user == null)
            {
                throw new Exception("User không tồn tại");
            }
            return user;
        }

        public async Task<MessageModelWithData<List<ResponseUserAddress>>> GetUserAddress()
        {
            int userId = _currentUserService.GetUserId();
            User user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User không tồn tại");
            }

            List<ResponseUserAddress> addresses = new List<ResponseUserAddress>();
            if(!string.IsNullOrWhiteSpace(user.Address))
            {
                addresses.Add(new ResponseUserAddress { Address = user.Address });
            }
            if (!string.IsNullOrWhiteSpace(user.SecondAddress))
            {
                addresses.Add(new ResponseUserAddress { Address = user.SecondAddress });
            }

            return new MessageModelWithData<List<ResponseUserAddress>>
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Danh sách địa chỉ",
                Data = addresses
            };
        }
    }
}
