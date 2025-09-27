using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Models;
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
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<AIConversationController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<AIConversationController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] int? characteristicID)
        {
            try
            {
                MessageModelWithData<Aiconversation> result = await _aiConversationService.CreateAIConversation(characteristicID);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Tạo cuộc trò chuyện thất bại lỗi server");
            }
        }

        // PUT api/<AIConversationController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<AIConversationController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
