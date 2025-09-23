using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Rating;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserInteractionController : ControllerBase
    {
        private readonly IUserInteractionService _userInteractionService;

        public UserInteractionController(IUserInteractionService userInteractionService) 
        {
            _userInteractionService = userInteractionService;
        }

        [HttpGet("userId")]
        public async Task<IActionResult> GetAllUserInteractionByUserId()
        {
            try
            {
                List<UserInteraction> result = await _userInteractionService.GetUserInteractionByUserIdAsync();
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return StatusCode(404, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("productId/{productId}")]
        public async Task<IActionResult> GetAllUserInteractionByProductId(string productId)
        {
            try
            {
                List<UserInteraction> result = await _userInteractionService.GetUserInteractionByProductIdAsync(productId);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return StatusCode(404, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRatingById(int id)
        {
            try
            {
                var result = await _userInteractionService.GetByIdAsync(id);
                return Ok(result);
            }
            catch (ArgumentNullException ex)
            {
                return StatusCode(404, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateUserInteractionDto request)
        {
            try
            {
                MessageModelWithData<UserInteraction> result = await _userInteractionService.CreateAsync(request);

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateUserInteractionDto request)
        {
            try
            {
                MessageModelWithData<UserInteraction> result = await _userInteractionService.UpdateAsync(id, request);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                MessageModel result = await _userInteractionService.DeleteAsync(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
