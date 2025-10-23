using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.TicketChat;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketChatController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly ITicketChatService _ticketChatService;

        public TicketChatController(IMessageService messageService, ITicketChatService ticketChatService)
        {
            _messageService = messageService;
            _ticketChatService = ticketChatService;
        }

        [HttpPost("send-message")]
        [Authorize(Roles = "Customer, Staff")]
        public async Task<IActionResult> SendMessageToTicketChat(RequestSendMessageTicket requestSendMessageTicket)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageModel
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ"
                });
            }

            try
            {
                MessageModel result = await _messageService.SendMessageToTicketChat(requestSendMessageTicket);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateTicketChatForCustomer(RequestCreateTicketChat requestCreateTicketChat)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageModel
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ"
                });
            }

            try
            {
                MessageModelWithData<ResponseCreateTicketChat> result =
                    await _ticketChatService.CreateTicketChatForCustomer(requestCreateTicketChat);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("assign")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> AssignStaffToTicketChat(RequestAssignTicketChat requestAssignTicketChat)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageModel
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ"
                });
            }

            try
            {
                MessageModelWithData<ResponseAssignTicketChat> result =
                    await _ticketChatService.AssignStaffToTicketChat(requestAssignTicketChat);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{ticketId}/close")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> FinishTicketChatForStaff(int ticketId)
        {
            try
            {
                MessageModel result = await _ticketChatService.FinishTicketChatForStaff(ticketId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("staff")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetTicketChatForStaff([FromQuery] PaginationParameter page,
            TicketChatStatusEnum? ticketChatStatusEnum, bool isDateDecrease)
        {
            try
            {
                MessageModelWithData<ResponseGetAllTicketChat> result =
                    await _ticketChatService.GetTicketChatForStaff(page, ticketChatStatusEnum, isDateDecrease);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("staff/open-tickets")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetOpenTicketAssignForStaff()
        {
            try
            {
                MessageModelWithData<List<TicketInformation>> result =
                    await _ticketChatService.GetOpenTicketAssignForStaff();
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("customer/open-tickets")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetOpenTicketForCustomer()
        {
            try
            {
                MessageModelWithData<Pagination<ResponseCustomerTicketChat>> result =
                    await _ticketChatService.GetOpenTicketForCustomer(new PaginationParameter());
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{slug}/messages")]
        [Authorize(Roles = "Customer, Staff")]
        public async Task<IActionResult> GetTicketChatMessages(string slug)
        {
            try
            {
                MessageModelWithData<ResponseTicketMessage> result =
                    await _ticketChatService.GetTicketChatMessageBySlug(slug);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}