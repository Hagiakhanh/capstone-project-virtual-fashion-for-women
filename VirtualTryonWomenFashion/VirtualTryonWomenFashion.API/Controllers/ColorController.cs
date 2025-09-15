using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ColorController : ControllerBase
    {
        private readonly IColorService _colorService;
        public ColorController(IColorService colorService)
        {
            _colorService = colorService;
        }
        // GET: api/<ColorController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                List<Color> result = await _colorService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/<ColorController>
        [HttpPost]
        public async Task<IActionResult> Post([FromForm] string colorName, string colorPrefix, string hexCode)
        {
            try
            {
                MessageModelWithData<Color> result = await _colorService.CreateColor(colorName, colorPrefix, hexCode);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
