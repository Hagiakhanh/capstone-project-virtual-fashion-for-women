using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Category;
using VirtualTryonWomenFashion.Service.DTO.Rating;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/rating")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingController(IRatingService ratingService) 
        {
            _ratingService = ratingService;
        }

        [HttpGet("all-product-rating/{productId}")]
        public async Task<IActionResult> GetAllProductRating(string productId) 
        {
            try
            {
                List<ResponseRatingDto> result = await _ratingService.GetAllProductRatingsAsync(productId);
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
        public async Task<IActionResult> GetRatingById(int ratingId)
        {
            try
            {
                var result = await _ratingService.GetRatingByIdAsync(ratingId);
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

        [HttpGet("customer-rating/{orderDetailId}")]
        public async Task<IActionResult> GetCustomerRatingInOrderDetailAsync(int orderDetailId)
        {
            try
            {
                var result = await _ratingService.GetRatingByOrderDetailIdAsync(orderDetailId);
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
        public async Task<IActionResult> Create([FromBody] CreateUpdateRatingDto rating)
        {
            try
            {
                MessageModelWithData<Rating> result = await _ratingService.CreateRatingAsync(rating);

                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateRatingDto rating)
        {
            try
            {
                MessageModelWithData<Rating> result = await _ratingService.UpdateRatingAsync(id, rating);
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
                MessageModel result = await _ratingService.DeleteRatingAsync(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
