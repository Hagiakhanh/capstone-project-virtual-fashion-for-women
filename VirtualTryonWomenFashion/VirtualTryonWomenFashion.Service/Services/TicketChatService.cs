using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.TicketChat;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class TicketChatService : ITicketChatService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly ITicketChatRepository _ticketChatRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMessageRepository _messageRepository;

        public TicketChatService(ICurrentUserService currentUserService, ITicketChatRepository ticketChatRepository,
            IUnitOfWork unitOfWork, IMessageRepository messageRepository)
        {
            _currentUserService = currentUserService;
            _ticketChatRepository = ticketChatRepository;
            _unitOfWork = unitOfWork;
            _messageRepository = messageRepository;
        }

        public async Task<MessageModelWithData<ResponseAssignTicketChat>> AssignStaffToTicketChat(
            RequestAssignTicketChat requestAssignTicketChat)
        {
            int staffId = _currentUserService.GetUserId();
            TicketChat ticketChat = await _ticketChatRepository.GetByIdAsync(requestAssignTicketChat.TicketChatId);
            if (ticketChat == null)
            {
                throw new Exception("Yêu cầu hỗ trợ không hợp lệ");
            }

            if (ticketChat.Status != TicketChatStatusEnum.Pending.ToString())
            {
                if (ticketChat.Status == TicketChatStatusEnum.Open.ToString() && ticketChat.StaffId != null)
                {
                    throw new InvalidOperationException("Yêu cầu hỗ trợ đã có người nhận xử lý");
                }

                // Ticket này đã được nhận
                throw new InvalidOperationException($"Ticket đang ở trạng thái {ticketChat.Status}, không thể nhận.");
            }

            ticketChat.StaffId = staffId;
            ticketChat.Status = TicketChatStatusEnum.Open.ToString();
            await _ticketChatRepository.UpdateAsync(ticketChat);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                // Thông báo realtime cho customer là đã có staff nhận 
                return new MessageModelWithData<ResponseAssignTicketChat>
                {
                    Message = "Tiếp nhận hỗ trợ thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = new ResponseAssignTicketChat { TicketSlug = ticketChat.Slug }
                };
            }

            return new MessageModelWithData<ResponseAssignTicketChat>
            {
                Message = "Tiếp nhận hỗ trợ thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }

        public async Task<MessageModelWithData<ResponseCreateTicketChat>> CreateTicketChatForCustomer(
            RequestCreateTicketChat requestCreateTicketChat)
        {
            int userId = _currentUserService.GetUserId();
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                TicketChat newTicketChat = new TicketChat
                {
                    CustomerId = userId,
                    Slug = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    Status = TicketChatStatusEnum.Pending.ToString(),
                    Title = requestCreateTicketChat.Title,
                };
                await _ticketChatRepository.InsertAsync(newTicketChat);
                await _unitOfWork.SaveChanges();

                if (!string.IsNullOrEmpty(requestCreateTicketChat.Message))
                {
                    // Thực hiện lưu tin nhắn đầu tiên của khách
                    Message newMessage = new Message
                    {
                        TicketChatId = newTicketChat.TicketChatId,
                        SenderId = userId,
                        Content = requestCreateTicketChat.Message,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    };
                    await _messageRepository.InsertAsync(newMessage);
                }

                int finalResult = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return new MessageModelWithData<ResponseCreateTicketChat>
                {
                    Message = "Tạo yêu cầu hỗ trợ thành công",
                    StatusCode = StatusCodes.Status201Created,
                    Data = new ResponseCreateTicketChat { TicketSlug = newTicketChat.Slug },
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<MessageModel> FinishTicketChatForStaff(int ticketChatId)
        {
            int staffId = _currentUserService.GetUserId();
            TicketChat ticketChat = await _ticketChatRepository.GetByIdAsync(ticketChatId);
            if (ticketChat == null)
            {
                throw new Exception("Không tìm thấy ticket chat");
            }

            if (ticketChat.Status != TicketChatStatusEnum.Open.ToString())
            {
                throw new Exception($"Trạng thái hiện tại của ticket là {ticketChat.Status}, không thể đóng");
            }

            if (ticketChat.StaffId != staffId)
            {
                throw new Exception("Ticket không thuộc hỗ trợ của nhân viên");
            }

            ticketChat.Status = TicketChatStatusEnum.Closed.ToString();
            ticketChat.ClosedAt = DateTime.UtcNow.AddHours(7);
            await _ticketChatRepository.UpdateAsync(ticketChat);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = "Đã đóng ticket",
                    StatusCode = StatusCodes.Status200OK
                };
            }

            return new MessageModel
            {
                Message = "Đóng ticket thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };
        }

        public async Task<MessageModelWithData<ResponseGetAllTicketChat>> GetTicketChatForStaff(
            PaginationParameter pagination, TicketChatStatusEnum? ticketChatStatusEnum, bool isDateDecrease)
        {
            Expression<Func<TicketChat, bool>> filterExpression = x => ticketChatStatusEnum.HasValue
                ? x.Status == ticketChatStatusEnum.Value.ToString()
                : x.Status == TicketChatStatusEnum.Pending.ToString() ||
                  x.Status == TicketChatStatusEnum.Open.ToString();
            int totalCount = await _ticketChatRepository.CountAsync(filterExpression);

            List<TicketChat> ticketChats = new();

            if (isDateDecrease)
            {
                // Ngày mới nằm bên trên
                ticketChats = await _ticketChatRepository.GetAll(
                    pagination: pagination,
                    includes: new Expression<Func<TicketChat, object>>[]
                    {
                        x => x.Customer,
                        x => x.Staff
                    },
                    filter: x => ticketChatStatusEnum.HasValue
                        ? x.Status == ticketChatStatusEnum.Value.ToString()
                        : x.Status == TicketChatStatusEnum.Pending.ToString() ||
                          x.Status == TicketChatStatusEnum.Open.ToString(),
                    orderBy: x => x.OrderByDescending(x => x.CreatedAt)
                );
            }
            else
            {
                // Ngày cũ nằm bên trên
                ticketChats = await _ticketChatRepository.GetAll(
                    pagination: pagination,
                    includes: new Expression<Func<TicketChat, object>>[]
                    {
                        x => x.Customer,
                        x => x.Staff
                    },
                    filter: x => ticketChatStatusEnum.HasValue
                        ? x.Status == ticketChatStatusEnum.Value.ToString()
                        : x.Status == TicketChatStatusEnum.Pending.ToString() ||
                          x.Status == TicketChatStatusEnum.Open.ToString(),
                    orderBy: x => x.OrderBy(x => x.CreatedAt)
                );
            }

            int totalPendingTicketCount =
                await _ticketChatRepository.CountAsync(x => x.Status == TicketChatStatusEnum.Pending.ToString());
            int totalOpenTicketCount =
                await _ticketChatRepository.CountAsync(x => x.Status == TicketChatStatusEnum.Open.ToString());
            int totalAssignedTicketCount = await _ticketChatRepository.CountAsync(
                x => x.Status == TicketChatStatusEnum.Open.ToString() && x.StaffId == _currentUserService.GetUserId());

            List<TicketInformation> ticketInfoList = ticketChats.Select(x => new TicketInformation
            {
                CustomerName = x.Customer?.FullName,
                TicketChatId = x.TicketChatId,
                CreateAt = x.CreatedAt,
                Title = x.Title,
                Status = x.Status,
                StaffName = x.Staff?.FullName
            }).ToList();
            ResponseGetAllTicketChat responseGetAllTicketChat = new ResponseGetAllTicketChat
            {
                PendingTicket = totalPendingTicketCount,
                OpenTicket = totalOpenTicketCount,
                MyAssignedTicket = totalAssignedTicketCount,
                TicketInformation = new Pagination<TicketInformation>(ticketInfoList, totalCount, pagination.PageIndex,
                    pagination.PageSize)
            };

            if (ticketInfoList.Any())
            {
                return new MessageModelWithData<ResponseGetAllTicketChat>
                {
                    Message = "Danh sách hỗ trợ",
                    StatusCode = StatusCodes.Status200OK,
                    Data = responseGetAllTicketChat
                };
            }

            return new MessageModelWithData<ResponseGetAllTicketChat>
            {
                Message = "Danh sách hỗ trợ trống",
                StatusCode = StatusCodes.Status200OK,
                Data = responseGetAllTicketChat
            };
        }

        public async Task<MessageModelWithData<List<TicketInformation>>> GetOpenTicketAssignForStaff()
        {
            int staffId = _currentUserService.GetUserId();
            List<TicketChat> ticketChats = await _ticketChatRepository.GetAll(
                filter: x => x.StaffId == staffId && x.Status == TicketChatStatusEnum.Open.ToString(),
                includes: new Expression<Func<TicketChat, object>>[]
                {
                    x => x.Customer,
                    x => x.Staff
                }
            );

            List<TicketInformation> ticketInfoList = ticketChats.Select(x => new TicketInformation
            {
                CustomerName = x.Customer?.FullName,
                TicketChatId = x.TicketChatId,
                CreateAt = x.CreatedAt,
                Title = x.Title,
                Status = x.Status,
                StaffName = x.Staff?.FullName
            }).ToList();

            if (ticketChats.Any())
            {
                return new MessageModelWithData<List<TicketInformation>>
                {
                    Message = "Danh sách yêu cầu hỗ trợ đang mở",
                    StatusCode = StatusCodes.Status200OK,
                    Data = ticketInfoList
                };
            }

            return new MessageModelWithData<List<TicketInformation>>()
            {
                Message = "Không có yêu cầu hỗ trợ đang mở",
                StatusCode = StatusCodes.Status404NotFound
            };
        }

        public async Task<MessageModelWithData<ResponseTicketMessage>> GetTicketChatMessageBySlug(
            string ticketChatSlug)
        {
            int userId = _currentUserService.GetUserId();

            TicketChat ticketChat = await _ticketChatRepository.GetTicketChatBySlug(ticketChatSlug);
            if (ticketChat == null)
            {
                throw new Exception("Yêu cầu hỗ trợ không tồn tại");
            }

            if (ticketChat.CustomerId != userId && ticketChat.StaffId != userId)
            {
                throw new Exception("Bạn không có quyền truy cập vào yêu cầu hỗ trợ này");
            }

            // Thời gian cũ nhat ở trên cùng
            List<Message> messages = ticketChat.Messages.OrderBy(x => x.CreatedAt).ToList();
            List<TicketMessageDetail> ticketMessages = messages.Select(x => new TicketMessageDetail()
            {
                MessageId = x.MessageId,
                SenderId = x.SenderId.Value,
                Content = x.Content,
                CreatedAt = x.CreatedAt,
                OwnerRole = ticketChat.CustomerId == x.SenderId ? "Customer" : "Staff"
            }).ToList();
            ResponseTicketMessage responseTicketMessage = new ResponseTicketMessage
            {
                Title = ticketChat.Title,
                TicketChatId = ticketChat.TicketChatId,
                TicketChatSlug = ticketChat.Slug,
                Messages = ticketMessages
            };
            if (ticketMessages.Any())
            {
                return new MessageModelWithData<ResponseTicketMessage>
                {
                    Message = "Danh sách tin nhắn",
                    StatusCode = StatusCodes.Status200OK,
                    Data = responseTicketMessage
                };
            }

            return new MessageModelWithData<ResponseTicketMessage>()
            {
                Message = "Không có tin nhắn nào",
                StatusCode = StatusCodes.Status200OK,
                Data = responseTicketMessage
            };
        }

        public async Task<MessageModelWithData<Pagination<ResponseCustomerTicketChat>>> GetOpenTicketForCustomer(
            PaginationParameter page)
        {
            int customerId = _currentUserService.GetUserId();
            // Lấy ticket của người dùng đó ở trạng thái open hoặc pending
            List<TicketChat> listTickets = await _ticketChatRepository.GetAll(
                pagination: page,
                filter: x => x.CustomerId == customerId && (x.Status == TicketChatStatusEnum.Open.ToString() ||
                                                            x.Status == TicketChatStatusEnum.Pending.ToString()),
                includes: new Expression<Func<TicketChat, object>>[]
                {
                    x => x.Messages
                },
                orderBy: x => x.OrderByDescending(x => x.CreatedAt)
            );

            List<ResponseCustomerTicketChat> responseCustomerTicketChats = listTickets.Select(x =>
                new ResponseCustomerTicketChat
                {
                    TicketChatId = x.TicketChatId,
                    TicketChatSlug = x.Slug,
                    Title = x.Title,
                    CreatedAt = x.CreatedAt,
                    Status = x.Status,
                    LastMessage = x.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault()?.Content
                }).ToList();
            int totalCount = await _ticketChatRepository.CountAsync(
                x => x.CustomerId == customerId && (x.Status == TicketChatStatusEnum.Open.ToString() ||
                                                    x.Status == TicketChatStatusEnum.Pending.ToString()));
            Pagination<ResponseCustomerTicketChat> pagedResult =
                new Pagination<ResponseCustomerTicketChat>(responseCustomerTicketChats, totalCount, page.PageIndex,
                    page.PageSize);

            if (pagedResult.Any())
            {
                return new MessageModelWithData<Pagination<ResponseCustomerTicketChat>>
                {
                    Message = "Danh sách yêu cầu hỗ trợ đang mở",
                    StatusCode = StatusCodes.Status200OK,
                    Data = pagedResult
                };
            }

            return new MessageModelWithData<Pagination<ResponseCustomerTicketChat>>
            {
                Message = "Không có yêu cầu hỗ trợ đang mở",
                StatusCode = StatusCodes.Status404NotFound
            };
        }
    }
}