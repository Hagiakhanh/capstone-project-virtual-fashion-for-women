using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Characteristic;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StyleTypeController : ControllerBase
    {
        private readonly IStyleTypeService _styleTypeService;
        public StyleTypeController(IStyleTypeService styleTypeService)
        {
            _styleTypeService = styleTypeService;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                List<StyleType> result = await _styleTypeService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] RequestCreateTypeOfCharacteristic requestModel)
        {
            try
            {
                MessageModelWithData<StyleType> result = await _styleTypeService.CreateAsync(requestModel.Name, requestModel.ImageFile);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
