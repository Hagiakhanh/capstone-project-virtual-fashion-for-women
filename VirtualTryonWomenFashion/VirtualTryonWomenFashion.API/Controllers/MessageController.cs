using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.IServices;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;
        public MessageController(IMessageService messageService)
        {
            _messageService = messageService;
        }
        // POST api/<MessageController>
        [HttpPost("AIConversation")]
        [Authorize(Roles = "Customer")]

        public async Task<IActionResult> SendMessageToAiConversation([FromBody] RequestCreateChatWithAI model)
        {
            try
            {
                var result = await _messageService.SendMessageToAIConversation(model.AIConversationID, model.Message);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Gửi tin nhắn thất bại");
            }
        }

    }
}
