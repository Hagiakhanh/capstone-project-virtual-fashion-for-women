using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OrderDetailService : IOrderDetailService
    {
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductVariantService _productVariantService;

        public OrderDetailService(
            IOrderDetailRepository orderDetailRepository,
            IUnitOfWork unitOfWork,
            IProductVariantService productVariantService
            )
        {
            _orderDetailRepository = orderDetailRepository;
            _unitOfWork = unitOfWork;
            _productVariantService = productVariantService;
        }
        public async Task<int> CreateOrderDetailAsync(List<OrderDetail> createOrderDetails)
        {
            
            await _orderDetailRepository.InsertAsync(createOrderDetails);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<List<ResponseOrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId)
        {
            var orderDetails = await _orderDetailRepository.GetOrderDetailsByOrderId(orderId);
            List<ResponseOrderDetail> listResponseOrderDetail = new List<ResponseOrderDetail>();
            foreach (var item in orderDetails)
            {
                ResponseProductVariantDto responseProductVariantDto = new ResponseProductVariantDto()
                {
                    ProductVariantId = item.ProductVariantId,
                    SizeId = item.ProductVariant.SizeId,
                    VariantName = item.ProductVariant.VariantName,
                    Quantity = item.ProductVariant.Quantity,
                    ImageUrl = item.ProductVariant.ImageUrl,
                    Status = item.ProductVariant.Status,
                    ProductWeight = item.ProductVariant.ProductWeight,
                    ProductLength = item.ProductVariant.ProductLength,
                    ProductWidth = item.ProductVariant.ProductWidth,
                    ProductHeight = item.ProductVariant.ProductHeight,
                    Size = item.ProductVariant.Size != null ? new ResponseSizeDto
                    {
                        SizeId = item.ProductVariant.Size.SizeId,
                        SizeCode = item.ProductVariant.Size.SizeCode
                    } : null,
                    ProductImages = item.ProductVariant.ProductColor.ProductImages?.Select(pi => new ResponseProductImageDto
                    {
                        ProductImageId = pi.ProductImageId,
                        ImageUrl = pi.ImageUrl
                    }).ToList() ?? new List<ResponseProductImageDto>()
                };
                
                listResponseOrderDetail.Add(item.MapToResponseOrderDetail(responseProductVariantDto));
            }

            return listResponseOrderDetail;
        }
    }
}
