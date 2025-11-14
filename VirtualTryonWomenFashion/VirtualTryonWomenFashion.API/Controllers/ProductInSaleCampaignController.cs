using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductInSaleCampaignController : ControllerBase
    {
        private readonly IProductInSaleCampaignService _productInSaleCampaignService;
        public ProductInSaleCampaignController(IProductInSaleCampaignService productInSaleCampaign)
        {
            _productInSaleCampaignService = productInSaleCampaign;
        }
        // GET: api/<SaleCampaignController>
        [HttpPost("validate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ValidateProductInSale([FromBody] RequestCheckingProductInSaleCampaign request)
        {
            try
            {
                var listForSaleCampaignForAdmin = await _productInSaleCampaignService.CheckListProductIdInSaleCampaign(request.startDate, request.endDate, request.listProductID);
                
                return StatusCode(listForSaleCampaignForAdmin.StatusCode, listForSaleCampaignForAdmin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("product/{productId}/campaign")]
        public async Task<IActionResult> GetListProductInExistingCampaign(string productId)
        {
            try
            {
                var listOfExistingCampaign = await _productInSaleCampaignService.GetProductInSaleCampaign(productId);
                return Ok(listOfExistingCampaign);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
