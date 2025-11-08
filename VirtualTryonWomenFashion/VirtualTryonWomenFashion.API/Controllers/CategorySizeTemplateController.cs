using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Size;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/categorySizeTemplate")]
    [ApiController]
    public class CategorySizeTemplateController : ControllerBase
    {
        private readonly ICategorySizeTemplateService _categorySizeTemplateService;

        public CategorySizeTemplateController(ICategorySizeTemplateService categorySizeTemplateService) 
        {
            _categorySizeTemplateService = categorySizeTemplateService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RequestCreateCategoryTemplatesModel sizeModel)
        {
            try
            {
                MessageModel result = await _categorySizeTemplateService.CreateCategoryTemplatesAsync(sizeModel);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{categoryId}")]
        public async Task<IActionResult> Put(int categoryId, [FromBody] RequestUpdateCategoryTemplatesModel sizeModel)
        {
            try
            {
                MessageModel result = await _categorySizeTemplateService.UpdateCategoryTemplatesAsync(categoryId, sizeModel);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("by-categoryid/{categoryId}")]
        public async Task<IActionResult> GetById(int categoryId)
        {
            try
            {
                var category = await _categorySizeTemplateService.GetAllTemplateByCategoryId(categoryId);
                return Ok(category);
            }
            catch (ArgumentNullException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}
