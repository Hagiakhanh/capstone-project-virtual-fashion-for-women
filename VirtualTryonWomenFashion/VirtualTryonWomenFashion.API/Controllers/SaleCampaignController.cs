using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SaleCampaignController : ControllerBase
    {
        private readonly ISaleCampaignService _saleCampaignService;
        public SaleCampaignController(ISaleCampaignService saleCampaignService)
        {
            _saleCampaignService = saleCampaignService;
        }
        // GET: api/<SaleCampaignController>
        [HttpGet]
        public async Task<IActionResult> Get(int pageSize, int pageIndex)
        {
            try
            {
                PaginationParameter paginationParameter = new PaginationParameter()
                {
                    PageSize = pageSize,
                    PageIndex = pageIndex
                };
                var listForSaleCampaignForAdmin = await _saleCampaignService.GetAllSaleCampaign(paginationParameter);
                return Ok(listForSaleCampaignForAdmin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/<SaleCampaignController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var result = await _saleCampaignService.GetDetailSaleCampaign(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/<SaleCampaignController>
        [HttpPost]
        public async Task<IActionResult> Post([FromForm] RequestCreateSaleCampaign model)
        {
            try
            {
                var result = await _saleCampaignService.CreateSaleCampaign(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/<SaleCampaignController>/5

        [HttpPut("{id}")]
        public async Task<IActionResult> Deactivate(int id, [FromForm] RequestUpdateSaleCampaign model)
        {
            try
            {
                var result = await _saleCampaignService.UpdateSaleCampaign(id, model);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE api/<SaleCampaignController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _saleCampaignService.DeleteSaleCampaign(id);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
