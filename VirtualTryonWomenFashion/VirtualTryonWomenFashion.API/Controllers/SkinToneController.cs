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
    public class SkinToneController : ControllerBase
    {
        private readonly ISkinToneService _skinToneService;
        public SkinToneController(ISkinToneService skinToneService)
        {
            _skinToneService = skinToneService;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                List<SkinTone> result = await _skinToneService.GetAllAsync();
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
                MessageModelWithData<SkinTone> result = await _skinToneService.CreateAsync(requestModel.Name, requestModel.ImageFile);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
