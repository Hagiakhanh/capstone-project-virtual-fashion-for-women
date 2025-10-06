using Microsoft.AspNetCore.Mvc;
using System.Reflection.PortableExecutable;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIConversationController : ControllerBase
    {
        private readonly IAiconversationService _aiConversationService;
        public AIConversationController(IAiconversationService aiConversationService)
        {
            _aiConversationService = aiConversationService;
        }

        // GET: api/<AIConversationController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                List<Aiconversation> result = await _aiConversationService.GetAllAIConversation();
                return StatusCode(200, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lấy danh sách các cuộc trò chuyện thất bại lỗi server");
            }
        }

        // GET api/<AIConversationController>/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                Aiconversation result = await _aiConversationService.GetConversationDetailByID(id);
                return StatusCode(200, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Lấy chi tiết của cuộc trò chuyện thất bại lỗi server");
            }
        }

        // POST api/<AIConversationController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RequestCreateAIConversation requestModel)
        {
            try
            {
                MessageModelWithData<Aiconversation> result = await _aiConversationService.CreateAIConversation(requestModel.CharacteristicId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Tạo cuộc trò chuyện thất bại lỗi server");
            }
        }

        // DELETE api/<AIConversationController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                MessageModel result = await _aiConversationService.DeleteConversationById(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Xoá cuộc trò chuyện thất bại lỗi server");
            }
        }
    }
}
