using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.GHN;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Utils;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly GHNSettings _ghnSettings;

        public OrderService(IOrderRepository orderRepository, IUnitOfWork unitOfWork, IOptions<GHNSettings> ghnSettings)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
            _ghnSettings = ghnSettings.Value;
        }
        public async Task<MessageModelWithData<List<ResponseOrderForStaff>>> GetAllOrderForStaff(PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease)
        {
            List<Order> listOrder = new();
            if (isDateDecrease)
            {
                // Ngày mới nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    orderBy: x => x.OrderByDescending(x => x.CreatedAt)
                );
            }
            else
            {
                // Ngày cũ nằm bên trên
                listOrder = await _orderRepository.GetAll(
                    pagination: page,
                    filter: x => !orderStatusEnum.HasValue || x.Status == orderStatusEnum.ToString(),
                    orderBy: x => x.OrderBy(x => x.CreatedAt)
                );
            }
            List<ResponseOrderForStaff> responseOrderForStaff = listOrder.Select(
                    x => new ResponseOrderForStaff
                    {
                        OrderID = x.OrderId,
                        ReceiverName = x.ReceiverName,
                        ReceiverPhone = x.ReceiverPhone,
                        CreatedAt = x.CreatedAt,
                        Status = ((OrderStatusEnum)Enum.Parse(typeof(OrderStatusEnum), x.Status)).ToString(),
                    }
                ).ToList();

            if (responseOrderForStaff.Any())
            {
                return new MessageModelWithData<List<ResponseOrderForStaff>>()
                {
                    Message = "Lấy dữ liệu đơn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = responseOrderForStaff
                };
            }
            return new MessageModelWithData<List<ResponseOrderForStaff>>
            {
                Message = "Lấy dữ liệu đơn hàng thất bại",
                StatusCode = StatusCodes.Status400BadRequest,
            };
        }

        public async Task<MessageModelWithData<ResponseOrderDetailForStaff>> GetOrderDetailForStaff(int orderID)
        {
            Order? order = await _orderRepository.GetOrderByOrderID(orderID);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }
            ResponseOrderDetailForStaff responseData = new ResponseOrderDetailForStaff
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                ReceiverAddress = order.ReceiverAddress,
                CreatedAt = order.CreatedAt,
                Status = ((OrderStatusEnum)Enum.Parse(typeof(OrderStatusEnum), order.Status)).ToString(),
                Amount = order.Amount,
                Note = order.Note,
                PackageWeight = order.PackageWeight,
                PackageHeight = order.PackageHeight,
                PackageWidth = order.PackageWidth,
                PackageLength = order.PackageLength,
                ShippingMoney = order.ShippingMoney,
                ShippingCode = order.ShippingCode,
                EstimatedDelivery = order.EstimatedDelivery,
                OrderDetails = order.OrderDetails.Select(x => new OrderDetailInformation
                {
                    OrderDetailID = x.OrderDetailId,
                    Quantity = x.Quantity,
                    VariantName = x.ProductVariant.VariantName,
                    ImageUrl = x.ProductVariant.ImageUrl,
                }).ToList(),
            };

            return new MessageModelWithData<ResponseOrderDetailForStaff>
            {
                Message = "Lấy dữ liệu chi tiết đơn hàng thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = responseData,
            };

        }

        public async Task<MessageModelWithData<string>> UpdateOrderStatusForStaff(int orderID)
        {
            Order? order = await _orderRepository.GetOrderByOrderID(orderID);
            if (order == null)
            {
                throw new Exception("ID của đơn hàng không hợp lệ");
            }
            if (order.Status != OrderStatusEnum.Confirmed.ToString())
            {
                throw new Exception("Trạng thái cập nhật không hợp lệ.");
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                order.Status = OrderStatusEnum.Packed.ToString();

                // Gửi request cho giao hàng nhanh
                using (var client = new HttpClient())
                {
                    //string url = $"{_ghnSettings.GHNBaseUrl}/shiip/public-api/v2/shipping-order/create";
                    GhnCreateOrderRequest ghnCreateOrderRequest = new GhnCreateOrderRequest
                    {
                        PaymentTypeId = 1,  // Người trả phí shop | 1: Seller, 2: Buyer
                        Note = order.Note,  // Note của khách hàng cho shipper
                        RequiredNote = "CHOXEMHANGKHONGTHU",    // Các phương thức khi nhận hàng | CHOTHUHANG , CHOXEMHANGKHONGTHU , KHONGCHOXEMHANG 
                        FromName = "Tên của cửa hàng",  // Tên của bên gửi 
                        FromPhone = "0868728859",   // Số điện thoại của bên gửi
                        FromAddress = "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",  // Địa chỉ gửi
                        FromWardName = "Phường Long Thạnh Mỹ", // Tên phường gửi | Phải theo api của GHN
                        FromDistrictName = "Thành Phố Thủ Đức", // Tên huyện gửi | Phải theo api của GHN
                        FromProvinceName = "Hồ Chí Minh", // Tên tỉnh gửi | Phải theo api của GHN
                        ReturnPhone = "0868728859", // Số điện thoại để trả lại hàng
                        ReturnAddress = "7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000, Việt Nam",    // Địa chỉ trả hàng
                        ReturnDistrictId = 3695,    // ID địa chỉ của huyện trả hàng | Phải theo api của GHN
                        ReturnWardCode = "90752",   // ID địa chỉ của phường trả hàng | Phải theo api của GHN
                        ClientOrderCode = "",   // Không thêm trường này
                        ToName = order.ReceiverName,    // Tên của khách hàng
                        ToPhone = order.ReceiverPhone,  // Số điện thoại của khách hàng
                        ToAddress = "số 54, Tăng Nhơn Phú B, Thủ Đức, Hồ Chí Minh", // Địa chỉ của khách hàng
                        ToWardCode = "90756",   // Phường của người nhận hàng | Phải theo api của GHN
                        ToDistrictId = 3695,    // Huyện của người nhận hàng | Phải theo api của GHN
                        CodAmount = 0,  // Tiền COD mà shipper phải thu
                        Content = "Tên đơn hàng",   // Có thể đặt tên sản phẩm ở đây
                        Weight = (int)order.PackageWeight.Value,    // Cân nặng đơn
                        Length = (int)order.PackageLength.Value,    // Chiều dài đơn
                        Width = (int)order.PackageWidth.Value,  // Chiều rộng đơn
                        Height = (int)order.PackageHeight.Value,    // Chiều cao đơn
                        PickStationId = 1444,   // Chưa rõ
                        //DeliverStationId = null,    // Chưa rõ
                        InsuranceValue = (int)order.Amount.Value,    // Giá trị đơn hàng
                        ServiceId = 0,  // Chưa rõ
                        ServiceTypeId = 2, // Loại dịch vụ giao | 2: E-commerce Delivery
                        //Coupon = null,  // Mã phiếu giảm giá
                        PickShift = new List<int> { 3 } // Ca lấy hàng | 3: (7h00 - 12h00)
                    };

                    client.BaseAddress = new Uri(_ghnSettings.GHNBaseUrl);
                    client.DefaultRequestHeaders.Add("Token", _ghnSettings.Token);
                    client.DefaultRequestHeaders.Add("ShopId", _ghnSettings.ShopId.ToString());

                    var options = new JsonSerializerOptions
                    {
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // bỏ qua field null
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase // GHN dùng snake_case -> mình map lại bằng [JsonPropertyName]
                    };
                    var jsonContent = new StringContent(
                                    JsonSerializer.Serialize(ghnCreateOrderRequest, options),
                                    Encoding.UTF8,
                                    "application/json");
                    var response = await client.PostAsync("shiip/public-api/v2/shipping-order/create", jsonContent);

                    if (response.IsSuccessStatusCode)
                    {
                        var resultGHN = await response.Content.ReadAsStringAsync();
                        GhnCreateOrderResponse resultGHNObj = JsonSerializer.Deserialize<GhnCreateOrderResponse>(resultGHN);
                        // ... xử lý result
                        await _orderRepository.UpdateAsync(order);
                        int result = await _unitOfWork.SaveChanges();
                        await _unitOfWork.CommitTransactionAsync();
                        if (result > 0)
                        {
                            return new MessageModelWithData<string>
                            {
                                Message = "Cập nhật trạng thái và tạo đơn vận chuyển thành công",
                                StatusCode = StatusCodes.Status200OK,
                                Data = $"{resultGHNObj.Data.OrderCode}"
                            };
                        }
                    }
                    else
                    {
                        var error = await response.Content.ReadAsStringAsync();
                        throw new Exception($"Không thể tạo đơn hàng vận chuyển. Lỗi GHN: {error}");
                    }

                }

                return new MessageModelWithData<string>
                {
                    Message = "Cập nhật trạng thái thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
