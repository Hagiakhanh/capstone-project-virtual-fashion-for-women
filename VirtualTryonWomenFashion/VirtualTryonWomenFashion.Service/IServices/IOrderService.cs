using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderService
    {
        public Task<MessageModelWithData<List<ResponseOrderForStaff>>> GetAllOrderForStaff(PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease);
        public Task<MessageModelWithData<ResponseOrderDetailForStaff>> GetOrderDetailForStaff(int orderID);
        public Task<MessageModelWithData<string>> UpdateOrderStatusForStaff(int orderID);
    }
}
