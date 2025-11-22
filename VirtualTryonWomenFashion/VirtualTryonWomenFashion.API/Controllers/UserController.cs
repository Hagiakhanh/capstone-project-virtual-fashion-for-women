using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
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
            }
            catch (Exception ex)
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
        public async Task<IActionResult> UpdateUserInformationAsync([FromRoute] int userId, [FromBody] RequestUpdateUser requestUpdateUser)
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

        [HttpGet("staffs")]
        public async Task<IActionResult> GetStaffList([FromQuery] PaginationParameter page, bool? isActive)
        {
            try
            {
                Pagination<ResponseStaffInformation> staffList = await _userService.GetAllStaffForAdmin(page, isActive);
                var metadata = new
                {
                    staffList.TotalCount,   
                    staffList.PageSize,
                    staffList.CurrentPage,
                    staffList.TotalPages
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Danh sách nhân viên",
                    StatusCode = StatusCodes.Status200OK,
                    Data = staffList
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
