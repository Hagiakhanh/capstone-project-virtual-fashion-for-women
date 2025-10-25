using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(
            IUserService userService
            )
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserInformationAsync()
        {
            try
            {
                UserInformation userInformation = await _userService.GetUserInformationAsync();
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Lấy thông tin user thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = userInformation
                });
            } catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Lấy thông tin user thất bại: " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserInformationAsync([FromRoute]int userId, [FromBody]RequestUpdateUser requestUpdateUser)
        {
            try
            {
                UserInformation userInformation = await _userService.UpdateUserInformationAsync(userId, requestUpdateUser);
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Cập nhật thông tin user thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = userInformation
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Cập nhập thông tin user thất bại: " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }
        }
    }
}
