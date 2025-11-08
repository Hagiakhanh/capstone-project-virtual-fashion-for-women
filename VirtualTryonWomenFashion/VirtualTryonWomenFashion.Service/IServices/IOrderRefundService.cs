using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.GHN;
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderRefundService
    {
        public Task<MessageModel> CreateOrderRefund(RequestCreateOrderRefund requestCreateOrderRefund);
        public Task<MessageModelWithData<Pagination<ResponseListOrderRefund>>> ListOrderRefundForCustomer(PaginationParameter page, OrderRefundStatusEnum? statusEnum);
        public Task<MessageModelWithData<Pagination<ResponseOrderRefundStaff>>> ListOrderRefundForStaff(PaginationParameter page, OrderRefundStatusEnum? statusEnum);
        public Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForCustomer(int orderRefundId);
        public Task<MessageModelWithData<ResponseOrderRefundDetail>> GetOrderRefundDetailForrStaff(int orderRefundId);
        public Task<MessageModelWithData<string>> UpdateOrderRefundForStaff(RequestUpdateOrderRefund requestUpdateOrderRefund);
        public Task<MessageModelWithData<GhnOrderSyncResponse>> UpdateOrderRefundStatusInGHNByCode(int orderRefundId);
        public Task<MessageModel> RefundMoneyOrderStatus(int orderRefundId);
    }
}
