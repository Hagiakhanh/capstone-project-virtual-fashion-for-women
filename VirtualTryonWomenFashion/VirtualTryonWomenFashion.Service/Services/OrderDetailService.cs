using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderDetailService : IOrderDetailService
    {
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IUnitOfWork _unitOfWork;

        public OrderDetailService(
            IOrderDetailRepository orderDetailRepository,
            IUnitOfWork unitOfWork
            )
        {
            _orderDetailRepository = orderDetailRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<int> CreateOrderDetailAsync(List<OrderDetail> createOrderDetails)
        {
            
            await _orderDetailRepository.InsertAsync(createOrderDetails);
            return await _unitOfWork.SaveChanges();
        }
    }
}
