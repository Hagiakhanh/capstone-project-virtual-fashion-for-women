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
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderRefundService : IOrderRefundService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderRefundRepository _orderRefundRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IOrderRefundDetailRepository _orderRefundDetailRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IOrderRefundImageRepository _orderRefundImageRepository;

        public OrderRefundService(ICurrentUserService currentUserService, IOrderRepository orderRepository,
            IOrderRefundRepository orderRefundRepository, IUnitOfWork unitOfWork, IOrderDetailRepository orderDetailRepository,
            IOrderRefundDetailRepository orderRefundDetailRepository, ICloudinaryService cloudinaryService,
            IOrderRefundImageRepository orderRefundImageRepository)
        {
            _currentUserService = currentUserService;
            _orderRepository = orderRepository;
            _orderRefundRepository = orderRefundRepository;
            _unitOfWork = unitOfWork;
            _orderDetailRepository = orderDetailRepository;
            _orderRefundDetailRepository = orderRefundDetailRepository;
            _cloudinaryService = cloudinaryService;
            _orderRefundImageRepository = orderRefundImageRepository;
        }
        public async Task<MessageModel> CreateOrderRefund(RequestCreateOrderRefund requestCreateOrderRefund)
        {
            int customerId = _currentUserService.GetUserId();
            Order order = await _orderRepository.GetOrderByOrderID(requestCreateOrderRefund.OrderID);
            if (order == null)
            {
                throw new Exception("Đơn hàng không tồn tại");
            }
            if (order.Customer.UserId != customerId)
            {
                throw new Exception("Đơn hàng không phải của bạn, không có quyền hoàn hàng");
            }
            if (order.Status != OrderStatusEnum.Delivered.ToString())
            {
                throw new Exception($"Trạng thái hiện tại là {order.Status}, không thể hoàn hàng");
            }
            bool hasAnyActiveRefund = await _orderRefundRepository.CheckNonRejectedRefundByOrderId(requestCreateOrderRefund.OrderID);
            if (hasAnyActiveRefund)
            {
                throw new Exception("Đơn hàng hiện tại đã có yêu cầu hoàn hàng");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                int countOrderRefund = await _orderRefundRepository.CountAsync(x => x.OrderId == requestCreateOrderRefund.OrderID);
                OrderRefund newOrderRefund = new OrderRefund
                {
                    OrderId = requestCreateOrderRefund.OrderID,
                    CustomerId = customerId,
                    CustomerReason = requestCreateOrderRefund.CustomerReason,
                    Status = OrderRefundStatusEnum.Pending.ToString(),
                    AttemptNumber = countOrderRefund + 1,
                    RefundAmount = 0,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    UpdatedAt = DateTime.UtcNow.AddHours(7)
                };
                await _orderRefundRepository.InsertAsync(newOrderRefund);
                await _unitOfWork.SaveChanges();

                decimal totalRefundAmount = 0;
                List<OrderRefundDetail> refundDetails = new List<OrderRefundDetail>();

                if (requestCreateOrderRefund.Items != null && requestCreateOrderRefund.Items.Any())
                {
                    // Trả theo từng item
                    List<int> orderDetailIds = requestCreateOrderRefund.Items.Select(x => x.OrderDetailID).ToList();
                    List<OrderDetail> orderDetails = await _orderDetailRepository.GetByListOrderDetailIdAsync(orderDetailIds);

                    foreach (var item in requestCreateOrderRefund.Items)
                    {
                        OrderDetail orderDetail = orderDetails.FirstOrDefault(x => x.OrderDetailId == item.OrderDetailID && x.OrderId == order.OrderId);
                        if (orderDetail == null || orderDetail.OrderId != order.OrderId)
                        {
                            throw new Exception($"Chi tiết sản phẩm {item.OrderDetailID} không hợp lệ");
                        }
                        OrderRefundDetail orderRefundDetail = new OrderRefundDetail
                        {
                            OrderRefundId = newOrderRefund.OrderRefundId,
                            OrderDetailId = orderDetail.OrderDetailId,
                            Quantity = orderDetail.Quantity,
                            RefundPriceAtTime = orderDetail.PriceAtTime,
                        };
                        refundDetails.Add(orderRefundDetail);

                        totalRefundAmount += orderDetail.Quantity * orderDetail.PriceAtTime;
                        //await _orderRefundDetailRepository.InsertAsync(orderRefundDetail);

                    }
                }
                else
                {
                    List<OrderDetail> allOrderDetails = await _orderDetailRepository.GetOrderDetailsByOrderId(order.OrderId);
                    foreach (var detail in allOrderDetails)
                    {
                        OrderRefundDetail orderRefundDetail = new OrderRefundDetail
                        {
                            OrderRefundId = newOrderRefund.OrderRefundId,
                            OrderDetailId = detail.OrderId,
                            Quantity = detail.Quantity,
                            RefundPriceAtTime = detail.PriceAtTime,
                        };
                        refundDetails.Add(orderRefundDetail);

                        totalRefundAmount += detail.Quantity * detail.PriceAtTime;
                        //await _orderRefundDetailRepository.InsertAsync(orderRefundDetail);
                    }

                }

                // Insert tổng order refund detail
                await _orderRefundDetailRepository.AddRangeAsync(refundDetails);

                // Cập nhật tổng số tiền hoàn
                newOrderRefund.RefundAmount = totalRefundAmount;
                await _orderRefundRepository.UpdateAsync(newOrderRefund);

                // Upload ảnh và lưu vào bảng OrderRefundImage
                if (requestCreateOrderRefund.ImageUrl != null && requestCreateOrderRefund.ImageUrl.Length > 0)
                {
                    var uploadTasks = requestCreateOrderRefund.ImageUrl
                                        .Select(file => _cloudinaryService.UploadImageAsync(file))
                                        .ToList();
                    var uploadedUrls = await Task.WhenAll(uploadTasks);

                    List<OrderRefundImage> refundImages = uploadedUrls
                                        .Select(url => new OrderRefundImage
                                        {
                                            OrderRefundId = newOrderRefund.OrderRefundId,
                                            ImageUrl = url,
                                        })
                                        .ToList();

                    await _orderRefundImageRepository.AddRangeAsync(refundImages);
                }

                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Tạo yêu cầu hoàn hàng thành công",
                        StatusCode = StatusCodes.Status200OK
                    };
                }
                return new MessageModel
                {
                    Message = "Tạo yêu cầu hoàn hàng thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

        }

        public async Task<MessageModelWithData<Pagination<ResponseListOrderRefund>>> ListOrderRefundForCustomer(PaginationParameter page, OrderRefundStatusEnum? statusEnum)
        {
            int customerId = _currentUserService.GetUserId();
            Expression<Func<OrderRefund, bool>> filterExpression = x => !statusEnum.HasValue || x.Status == statusEnum.Value.ToString();

            List<OrderRefund> orderRefunds = await _orderRefundRepository.GetListOrderRefundForCustomer(statusEnum.ToString(), page.PageIndex, page.PageSize, customerId);

            List<ResponseListOrderRefund> responseListOrderRefunds = orderRefunds.Select(x => new ResponseListOrderRefund
            {
                OrderRefundId = x.OrderRefundId,
                Status = x.Status,
                Amount = x.RefundAmount,
                CreatedAt = x.CreatedAt,
                Address = x.Order.ReceiverAddress,
                itemRefunds = x.OrderRefundDetails.Select(item => new ItemRefund
                {
                    ProductVarientName = item.OrderDetail.ProductVariant.VariantName,
                    ProductVarientImage = item.OrderDetail.ProductVariant.ImageUrl
                }).ToList()
            }).ToList();

            int totalCount = await _orderRefundRepository.CountAsync(filterExpression);
            Pagination<ResponseListOrderRefund> pageResult = new Pagination<ResponseListOrderRefund>(responseListOrderRefunds, totalCount, page.PageIndex, page.PageSize);

            if (responseListOrderRefunds.Any())
            {
                return new MessageModelWithData<Pagination<ResponseListOrderRefund>>
                {
                    Message = "Danh sách đơn hoàn hàng",
                    StatusCode = StatusCodes.Status200OK,
                    Data = pageResult
                };
            }

            return new MessageModelWithData<Pagination<ResponseListOrderRefund>>
            {
                Message = "Danh sách đơn hoàn hàng trống",
                StatusCode = StatusCodes.Status200OK,
                Data = pageResult
            };

        }

        public Task ListOrderRefundForStaff()
        {
            throw new NotImplementedException();
        }

        public async Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForCustomer(int orderRefundId)
        {
            int customerId = _currentUserService.GetUserId();
            OrderRefund orderRefund = await _orderRefundRepository.GetOrderRefundById(orderRefundId);
            if (orderRefund == null)
            {
                throw new Exception("Yêu cầu hoàn hàng không hợp lệ");
            }
            if (orderRefund.CustomerId != customerId)
            {
                throw new Exception("Không có quyền xem chi tiết yêu cầu hoàn hàng này");
            }

            int productCount = orderRefund.OrderRefundDetails.Count();
            decimal amountRefund = orderRefund.OrderRefundDetails.Sum(detail => detail.Quantity * detail.RefundPriceAtTime);

            ResponseOrderRefundDetail responseOrderRefundDetail = new ResponseOrderRefundDetail
            {
                OrderRefundId = orderRefund.OrderRefundId,
                CreatedAt = orderRefund.CreatedAt,
                OrderRefundStatus = orderRefund.Status,
                ProductCount = productCount,
                CustomerName = orderRefund.Customer.FullName,
                CustomerPhone = orderRefund.Customer.PhoneNumber,
                CustomerEmail = orderRefund.Customer.Email,
                ReceiverName = orderRefund.Order.ReceiverName,
                ReceiverAddress = orderRefund.Order.ReceiverAddress,
                ReceiverPhone = orderRefund.Order.ReceiverPhone,
                Amount = amountRefund,
                TransactionStatus = orderRefund.Transaction?.Status,
                TransactionTime = orderRefund.Transaction?.CreatedAt,
                Items = orderRefund.OrderRefundDetails.Select(detail => new OrderRefundDetailItem
                {
                    VariantName = detail.OrderDetail.ProductVariant.VariantName,
                    VariantImage = detail.OrderDetail.ProductVariant.ImageUrl,
                    VariantColor = detail.OrderDetail.ProductVariant.ProductColor.Color.ColorName,
                    VariantSize = detail.OrderDetail.ProductVariant.Size.SizeCode,
                    VariantPrice = detail.OrderDetail.PriceAtTime,
                    Quantity = detail.OrderDetail.Quantity,
                    VariantAmount = detail.OrderDetail.Quantity * detail.OrderDetail.PriceAtTime,
                }).ToList(),
            };

            return new MessageModelWithData<ResponseOrderRefundDetail>
            {
                Message = "Thông tin chi tiết yêu cầu hoàn hàng",
                StatusCode = StatusCodes.Status200OK,
                Data = responseOrderRefundDetail
            };

        }

    }
}
