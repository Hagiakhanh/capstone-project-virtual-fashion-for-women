using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAccount(RequestCreateAccount requestCreateAccount)
        {
            try
            {
                MessageModel result = await _userService.RegisterCustomerAccount(requestCreateAccount);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmAccount(RequestConfirmAccount requestConfirmAccount)
        {
            try
            {
                MessageModel result = await _userService.ConfirmAccount(requestConfirmAccount);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAccount(RequestLoginAccount requestLoginAccount)
        {
            try
            {
                MessageModelWithData<string> result = await _userService.LoginAccount(requestLoginAccount);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> LogoutUser()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var expiryTime = jwtToken.ValidTo - DateTime.UtcNow;

                MessageModel result = await _userService.LogoutUser(token, expiryTime);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("staff/register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterStaffAccount(RequestCreateAccount requestCreateAccount)
        {
            try
            {
                MessageModel result = await _userService.CreateStaffAccount(requestCreateAccount);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/{staffId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatusStaffForAdmin(int staffId)
        {
            try
            {
                MessageModel result = await _userService.UpdateStatusStaffForAdmin(staffId);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("login-google")]
        public async Task<IActionResult> LoginWithGoogle(RequestLoginGoogle requestLoginGoogle)
        {
            try
            {
                MessageModelWithData<string> result = await _userService.LoginByGoogle(requestLoginGoogle);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
