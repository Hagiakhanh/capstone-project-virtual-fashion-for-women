using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Characteristic;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CharacteristicController : ControllerBase
    {
        private readonly ICharacteristicService _characteristicService;
        public CharacteristicController(ICharacteristicService characteristicService)
        {
            _characteristicService = characteristicService;
        }
        // GET: api/<CharacteristicController>
        [HttpGet]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetCurrentCharacteristicForUser()
        {
            try
           {
                Characteristic result = await _characteristicService.GetCurrentCharacteristicForUser();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lấy phong cách cá nhân thất bại");
            }
        }

        // POST api/<CharacteristicController>
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Post([FromBody] RequestCreateUserCharacteristics requestModel)
        {
            try
            {
                MessageModelWithData<Characteristic> result = await _characteristicService.CreateCharacteristic(requestModel);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Tạo phong cách cá nhân thất bại");
            }
        }

        // PUT api/<CharacteristicController>/5
        [HttpPut]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Put([FromBody] RequestCreateUserCharacteristics model)
        {
            try
            {
                MessageModelWithData<Characteristic> result = await _characteristicService.UpdateCharacteristic(model);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Cập nhật phong cách cá nhân thất bại");
            }
        }
    }
}
