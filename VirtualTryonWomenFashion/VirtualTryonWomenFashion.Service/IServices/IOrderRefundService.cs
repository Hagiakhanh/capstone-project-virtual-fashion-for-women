using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderRefundService
    {
        public Task<MessageModel> CreateOrderRefund(RequestCreateOrderRefund requestCreateOrderRefund);
        public Task<MessageModelWithData<Pagination<ResponseListOrderRefund>>> ListOrderRefundForCustomer(PaginationParameter page, OrderRefundStatusEnum? statusEnum);
        public Task ListOrderRefundForStaff();
        public Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForCustomer(int orderRefundId);
    }
}
