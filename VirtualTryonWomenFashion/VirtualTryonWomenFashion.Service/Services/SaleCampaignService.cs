using AutoMapper;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class SaleCampaignService : ISaleCampaignService
    {
        private readonly ISaleCampaignRepository _saleCampaignRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductInSaleCampaignService _productInSaleCampaignService;
        private readonly IProductRepository _productRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;
        private readonly IOrderDetailRepository _orderDetailRepository;
        public SaleCampaignService(ISaleCampaignRepository saleCampaignRepository, IUnitOfWork unitOfWork, IProductRepository productRepository,
            ICloudinaryService cloudinaryService, IMapper mapper, IProductInSaleCampaignService productInSaleCampaignService, IOrderDetailRepository orderDetailRepository)
        {
            _saleCampaignRepository = saleCampaignRepository;
            _unitOfWork = unitOfWork;
            _productRepository = productRepository;
            _cloudinaryService = cloudinaryService;
            _mapper = mapper;
            _productInSaleCampaignService = productInSaleCampaignService;
            _orderDetailRepository = orderDetailRepository;
        }

        public async Task<MessageModel> CreateSaleCampaign(RequestCreateSaleCampaign model)
        {
            MessageModelWithData<ResponseCheckedProductInSaleCampaign> checkedResult = new();
            List<ProductInSaleCampaign> listProductInSale = new List<ProductInSaleCampaign>();

            try
            {
                DateHelper.EnsureValidDateRange(model.StartDate, model.EndDate);
                DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
                if (today > model.StartDate)
                {
                    throw new ArgumentException("Ngày chiến dịch hoạt động không phải là thời gian trong quá khứ");
                }
                if ((model.EndDate.DayNumber - model.StartDate.DayNumber) < 2)
                {
                    throw new ArgumentException("Thời gian chiến dịch hoạt động ít nhất trong vòng 2 ngày");
                }
                ValidateProductInSaleCampaignsBasic(model.ProductInSalesCampaigns);
                List<string> listProductId = model.ProductInSalesCampaigns.Select(x => x.ProductID).ToList();
                checkedResult = await _productInSaleCampaignService.CheckListProductIdInSaleCampaign(model.StartDate, model.EndDate, listProductId);
                List<string> listValidProductId = checkedResult.Data.ValidProductIDList;

                if (checkedResult.Data.InvalidProductIDList.Count > 0)
                {
                    throw new ArgumentException("Chiến dịch này đang có các sản phẩm đang nằm trong chiến dịch giảm giá khác");
                }

                SaleCampaign saleCampaign = new SaleCampaign()
                {
                    CampaignName = model.CampaignName,
                    Description = model.Description,
                    StartDate = model.StartDate,
                    EndDate = model.EndDate,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    Status = today == model.StartDate ? SaleCampaignStatusEnum.Active.ToString() : SaleCampaignStatusEnum.Pending.ToString(),
                };
                string imageUrl = await _cloudinaryService.UploadImageAsync(model.ImageFile);
                saleCampaign.ImageUrl = imageUrl;
                await _saleCampaignRepository.InsertAsync(saleCampaign);
                await _unitOfWork.SaveChanges();
                List<Product> listValidProduct = await _productRepository.GetAll(null, x => listValidProductId.Contains(x.ProductId) && x.IsDeleted == false);
                ValidateProductInSaleCampaigns(model.ProductInSalesCampaigns, listValidProduct);
                foreach (string productId in checkedResult.Data.ValidProductIDList)
                {
                    if (listProductId.Contains(productId))
                    {
                        RequestCreateProductInSaleCampaign selectedProduct = model.ProductInSalesCampaigns.FirstOrDefault(x => x.ProductID.Equals(productId));
                        Product detailProduct = listValidProduct.FirstOrDefault(x => x.ProductId.Equals(productId));
                        if (detailProduct == null)
                        {
                            throw new ArgumentException("Sản phẩm không tồn tại");
                        }
                        decimal originalPrice = detailProduct.Price ?? 0;
                        decimal salePercent = 0;
                        decimal salePrice = 0;

                        if (selectedProduct.DiscountType == SalePriceTypeInputEnum.PercentDiscount)
                        {
                            salePercent = selectedProduct.Value;
                            salePrice = Math.Round(
                                originalPrice * (1 - (salePercent / 100)),
                                0,
                                MidpointRounding.AwayFromZero
                            );
                        }
                        else
                        {
                            salePrice = selectedProduct.Value;
                            salePercent = Math.Round(
                                (1 - (salePrice / originalPrice)) * 100,
                                2,
                                MidpointRounding.AwayFromZero
                            );
                        }

                        listProductInSale.Add(new ProductInSaleCampaign()
                        {
                            CampaignId = saleCampaign.CampaignId,
                            ProductId = productId,
                            SalePrice = salePrice,
                            PercentDiscount = salePercent
                        });
                    }
                }
                await _productInSaleCampaignService.InsertListProductInSaleCampaign(listProductInSale);
                await _unitOfWork.SaveChanges();
                return new MessageModel
                {
                    Message = "Tạo thành công chiến dịch giảm giá",
                    StatusCode = StatusCodes.Status201Created,
                };
            }
            catch (ArgumentException agrumentEx)
            {
                return new MessageModel
                {
                    Message = "Tạo thất bại - " + agrumentEx.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModel
                {
                    Message = "Tạo thất bại - Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModel> DeleteSaleCampaign(int saleCampaignID)
        {
            try
            {
                SaleCampaign currentSaleCampaign = await _saleCampaignRepository.GetByIdAsync(saleCampaignID);
                if (!currentSaleCampaign.IsDeleted)
                {
                    currentSaleCampaign.IsDeleted = true;
                    await _saleCampaignRepository.UpdateAsync(currentSaleCampaign);
                    await _unitOfWork.SaveChanges();
                    return new MessageModel
                    {
                        Message = "Xoá thành công chiến dịch giảm giá",
                        StatusCode = StatusCodes.Status200OK
                    };
                }
                else
                {
                    throw new ArgumentException("Chiến dịch đã bị xoá không thể thao tác");
                }
            }
            catch (ArgumentException ex)
            {
                return new MessageModel
                {
                    Message = "Xoá thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModel
                {
                    Message = "Xoá thất bại - Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }

        }

        public async Task<ResponsePaginationModel<List<ResponseGetShortSaleCampaignDetail>>> GetAllSaleCampaign(PaginationParameter paginationParameter)
        {
            // for admin
            try
            {
                int totalRecords = _saleCampaignRepository.Count(x => x.IsDeleted == false);
                List<SaleCampaign> listSaleCampaign = await _saleCampaignRepository.GetAll(paginationParameter, x => x.IsDeleted == false, null, []);
                int totalPages = (int)Math.Ceiling((decimal)totalRecords / paginationParameter.PageSize);
                List<ResponseGetShortSaleCampaignDetail> listMapper = _mapper.Map<List<ResponseGetShortSaleCampaignDetail>>(listSaleCampaign);
                return new ResponsePaginationModel<List<ResponseGetShortSaleCampaignDetail>>(StatusCodes.Status200OK, listMapper, totalRecords, totalPages);

            }
            catch (Exception ex)
            {
                return new ResponsePaginationModel<List<ResponseGetShortSaleCampaignDetail>>(StatusCodes.Status400BadRequest, [], 0, 0);
            }
        }

        public async Task<MessageModelWithData<ResponseGetSaleCampaign>> GetDetailSaleCampaign(int saleCampaignID)
        {
            try
            {
                SaleCampaign currentSaleCampaign = await _saleCampaignRepository.GetByIdAsync(saleCampaignID);
                ResponseGetSaleCampaign mappedSaleCampaign = _mapper.Map<ResponseGetSaleCampaign>(currentSaleCampaign);
                List<ResponseGetProductInSaleCampaign> listProductInSale = await _productInSaleCampaignService.GetListProductBasedCampaignID(saleCampaignID);
                if (currentSaleCampaign == null || currentSaleCampaign.IsDeleted)
                {
                    return new MessageModelWithData<ResponseGetSaleCampaign>
                    {
                        Message = "Chiến dịch giảm giá đã bị xoá hoặc không tồn tại",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }
                mappedSaleCampaign.ListProductInSaleCampaign = listProductInSale;
                return new MessageModelWithData<ResponseGetSaleCampaign>
                {
                    Message = "Xem chi tiết chiến dịch giảm giá thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = mappedSaleCampaign
                };

            }
            catch (Exception ex)
            {
                return new MessageModelWithData<ResponseGetSaleCampaign>
                {
                    Message = "Tìm chiến dịch giảm giá thất bại - Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError,
                };
            }
        }
        public void ValidateProductInSaleCampaigns(
    List<RequestCreateProductInSaleCampaign> products,
    List<Product> productDetails)
        {
            foreach (var p in products)
            {
                if (string.IsNullOrWhiteSpace(p.ProductID))
                {
                    throw new ArgumentException("ProductID không được để trống");
                }

                var productDetail = productDetails.FirstOrDefault(x => x.ProductId == p.ProductID);
                if (productDetail == null)
                {
                    throw new ArgumentException($"Sản phẩm {p.ProductID} không tồn tại");
                }

                decimal originalPrice = productDetail.Price ?? 0;
                if (originalPrice <= 0)
                {
                    throw new ArgumentException($"Sản phẩm {p.ProductID} chưa có giá gốc hợp lệ");
                }

                // validate discount
                if (p.DiscountType == SalePriceTypeInputEnum.PercentDiscount)
                {
                    if (p.Value < 1 || p.Value > 99)
                    {
                        throw new ArgumentException($"Sản phẩm {p.ProductID}: % giảm giá phải nằm trong khoảng 1 đến 99");
                    }
                }
                else // Direct price
                {
                    if (p.Value <= 0)
                    {
                        throw new ArgumentException($"Sản phẩm {p.ProductID}: giá giảm phải > 0");
                    }
                    if (p.Value >= originalPrice)
                    {
                        throw new ArgumentException($"Sản phẩm {p.ProductID}: giá sau giảm phải nhỏ hơn giá gốc ({originalPrice})");
                    }
                }
            }
            var duplicateIds = products.GroupBy(x => x.ProductID)
                               .Where(g => g.Count() > 1)
                               .Select(g => g.Key)
                               .ToList();
            if (duplicateIds.Any())
            {
                throw new ArgumentException($"Danh sách có sản phẩm trùng lặp: {string.Join(", ", duplicateIds)}");
            }
        }

        public async Task<MessageModelWithData<ResponseGetSaleCampaign>> UpdateSaleCampaign(
     int campaignId,
     RequestUpdateSaleCampaign model
 )
        {
            try
            {
                var campaign = await _saleCampaignRepository.GetByIdAsync(campaignId);
                if (campaign == null || campaign.IsDeleted)
                {
                    return new MessageModelWithData<ResponseGetSaleCampaign>
                    {
                        Message = "Chiến dịch không tồn tại hoặc đã bị xoá",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // cập nhật thông tin cơ bản
                if (!string.IsNullOrWhiteSpace(model.CampaignName))
                    campaign.CampaignName = model.CampaignName;

                if (!string.IsNullOrWhiteSpace(model.DescriptionUpdated))
                    campaign.Description = model.DescriptionUpdated;
                // cập nhật trạng thái nếu hợp lệ

                if (model.CampaignStatus.HasValue)
                {
                    if (model.CampaignStatus == SaleCampaignStatusEnum.Active || model.CampaignStatus == SaleCampaignStatusEnum.InActive)
                    {
                        campaign.Status = model.CampaignStatus.ToString();
                    }
                    else
                    {
                        throw new ArgumentException("Trạng thái chiến dịch cập nhật không hợp lệ");
                    }

                }
                // cập nhật hình ảnh
                if (model.ImageFile != null)
                {
                    string imageUrl = await _cloudinaryService.UploadImageAsync(model.ImageFile);
                    campaign.ImageUrl = imageUrl;
                }



                // xử lý cập nhật sản phẩm
                var productInCampaigns = campaign.ProductInSaleCampaigns?.ToList() ?? new List<ProductInSaleCampaign>();

                // xoá sản phẩm theo ListIdDeleted
                if (model.ListIdDeleted != null && model.ListIdDeleted.Any())
                {
                    productInCampaigns.RemoveAll(p => model.ListIdDeleted.Contains(p.ProductId));
                    await _productInSaleCampaignService.BulkDeleteProductInCampaign(campaignId, model.ListIdDeleted);
                }

                // thêm hoặc update sản phẩm
                if (model.ProductInSalesCampaigns != null && model.ProductInSalesCampaigns.Any())
                {
                    var productIds = model.ProductInSalesCampaigns.Select(p => p.ProductID).ToList();
                    var productDetails = await _productRepository.GetAll(null, x => (productIds.Contains(x.ProductId) && !x.IsDeleted.Value));

                    ValidateProductInSaleCampaigns(model.ProductInSalesCampaigns, productDetails);

                    foreach (var requestProd in model.ProductInSalesCampaigns)
                    {
                        var detailProduct = productDetails.First(x => x.ProductId == requestProd.ProductID);
                        decimal originalPrice = detailProduct.Price ?? 0;

                        decimal salePercent = 0;
                        decimal salePrice = 0;

                        if (requestProd.DiscountType == SalePriceTypeInputEnum.PercentDiscount)
                        {
                            salePercent = requestProd.Value;
                            salePrice = Math.Round(originalPrice * (1 - (salePercent / 100)), 0, MidpointRounding.AwayFromZero);
                        }
                        else
                        {
                            salePrice = requestProd.Value;
                            salePercent = Math.Round((1 - (salePrice / originalPrice)) * 100, 2, MidpointRounding.AwayFromZero);
                        }

                        var existingProd = productInCampaigns.FirstOrDefault(p => p.ProductId == requestProd.ProductID);
                        if (existingProd != null)
                        {
                            // update sản phẩm đã có
                            existingProd.SalePrice = salePrice;
                            existingProd.PercentDiscount = salePercent;
                        }
                        else
                        {
                            // thêm mới
                            productInCampaigns.Add(new ProductInSaleCampaign
                            {
                                CampaignId = campaign.CampaignId,
                                ProductId = requestProd.ProductID,
                                SalePrice = salePrice,
                                PercentDiscount = salePercent
                            });
                        }
                    }
                }

                // gán lại danh sách sản phẩm
                campaign.ProductInSaleCampaigns = productInCampaigns;

                await _saleCampaignRepository.UpdateAsync(campaign);
                await _unitOfWork.SaveChanges();

                var response = new ResponseGetSaleCampaign
                {
                    CampaignId = campaign.CampaignId,
                    CampaignName = campaign.CampaignName,
                    Description = campaign.Description,
                    StartDate = campaign.StartDate,
                    EndDate = campaign.EndDate,
                    Status = campaign.Status,
                    ImageUrl = campaign.ImageUrl,
                };

                return new MessageModelWithData<ResponseGetSaleCampaign>
                {
                    Message = "Cập nhật chiến dịch thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = response
                };
            }
            catch (ArgumentException ex)
            {
                return new MessageModelWithData<ResponseGetSaleCampaign>
                {
                    Message = "Cập nhật thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<ResponseGetSaleCampaign>
                {
                    Message = "Cập nhật thất bại - Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public void ValidateProductInSaleCampaignsBasic(List<RequestCreateProductInSaleCampaign> products)
        {
            if (products == null || !products.Any())
            {
                throw new ArgumentException("Danh sách sản phẩm không được để trống");
            }

            foreach (var p in products)
            {
                if (string.IsNullOrWhiteSpace(p.ProductID))
                {
                    throw new ArgumentException("ProductID không được để trống");
                }

                if (p.DiscountType == SalePriceTypeInputEnum.PercentDiscount)
                {
                    if (p.Value < 1 || p.Value > 99)
                    {
                        throw new ArgumentException(
                            $"Sản phẩm {p.ProductID}: % giảm giá phải nằm trong khoảng 1 đến 99"
                        );
                    }
                }
                else // Direct price
                {
                    if (p.Value <= 0)
                    {
                        throw new ArgumentException(
                            $"Sản phẩm {p.ProductID}: giá sau giảm phải > 0"
                        );
                    }
                }
            }

            // check trùng ID
            var duplicateIds = products.GroupBy(x => x.ProductID)
                                       .Where(g => g.Count() > 1)
                                       .Select(g => g.Key)
                                       .ToList();
            if (duplicateIds.Any())
            {
                throw new ArgumentException(
                    $"Danh sách có sản phẩm trùng lặp: {string.Join(", ", duplicateIds)}"
                );
            }
        }

        public async Task ChangeStatusForExistingSaleCampaign()
        {
            try
            {
                DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));

                List<SaleCampaign> listExistingSaleCampaign = await _saleCampaignRepository.GetAll(null, x => x.IsDeleted == false
                && (x.Status == SaleCampaignStatusEnum.InActive.ToString() || x.Status == SaleCampaignStatusEnum.Active.ToString()
                || x.Status == SaleCampaignStatusEnum.Pending.ToString()));

                List<SaleCampaign> listToExpired = listExistingSaleCampaign.Where(x => x.EndDate < today
                && x.Status != SaleCampaignStatusEnum.Pending.ToString()).ToList();
                foreach (SaleCampaign expiredItem in listToExpired)
                {
                    expiredItem.Status = SaleCampaignStatusEnum.Expired.ToString();
                }

                List<SaleCampaign> listWaiting = listExistingSaleCampaign.Where(x => x.StartDate <= today && x.EndDate >= today
                && x.Status == SaleCampaignStatusEnum.Pending.ToString()).ToList();
                foreach (SaleCampaign pendingItem in listWaiting)
                {
                    pendingItem.Status = SaleCampaignStatusEnum.Active.ToString();
                }

                if (listWaiting.Any() || listToExpired.Any())
                {
                    IEnumerable<SaleCampaign> mergeResult = listWaiting.Concat(listToExpired);
                    await _saleCampaignRepository.UpdateRangeAsync(mergeResult);
                    await _unitOfWork.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<ResponseSaleCampaignStatistic> GetStatisticBySaleCampaignID(
    int saleCampaignID, DateOnly? startDate = null, DateOnly? endDate = null)
        {
            // Lấy thông tin chiến dịch
            if (startDate.HasValue && endDate.HasValue)
            {
                if (endDate.Value < startDate.Value)
                {
                    throw new ArgumentException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
                }
            }
            var campaign = await _saleCampaignRepository.GetByIdAsync(saleCampaignID);
            if (campaign == null || campaign.IsDeleted)
                throw new ArgumentException("Chiến dịch không tồn tại hoặc đã bị xoá");

            // Xác định phạm vi ngày
            DateOnly actualStart = startDate ?? campaign.StartDate.Value;
            DateOnly actualEnd = endDate ?? campaign.EndDate.Value;

            // Lấy danh sách sản phẩm thuộc chiến dịch
            var productInCampaigns = campaign.ProductInSaleCampaigns?.ToList() ?? [];
            var productIds = productInCampaigns.Select(x => x.ProductId).ToList();

            if (!productIds.Any())
            {
                return new ResponseSaleCampaignStatistic
                {
                    TotalRevenue = 0,
                    TotalSoldQuantity = 0,
                    AverageRevenuePerDate = 0,
                    ListProductInCampaign = new(),
                    ListSaleRevenueDate = new()
                };
            }

            var orderDetails = await _orderDetailRepository.GetAllThenInclude(
                null,
                od => od.CampaignId == campaign.CampaignId
                   && od.Order.Status == OrderStatusEnum.Completed.ToString(), null,
                [x => x.ProductVariant.ProductColor.Product]
            );

            if (orderDetails == null || !orderDetails.Any())
            {
                return new ResponseSaleCampaignStatistic
                {
                    TotalRevenue = 0,
                    TotalSoldQuantity = 0,
                    AverageRevenuePerDate = 0,
                    ListProductInCampaign = new(),
                    ListSaleRevenueDate = new()
                };
            }

            // Tổng doanh thu & số lượng
            decimal totalRevenue = orderDetails.Sum(x => x.PriceAtTime);
            int totalSoldQuantity = orderDetails.Sum(x => x.Quantity);

            // Trung bình doanh thu mỗi ngày
            int totalDays = (actualEnd.DayNumber - actualStart.DayNumber) + 1;
            decimal avgRevenue = totalDays > 0 ? totalRevenue / totalDays : totalRevenue;

            // Nhóm doanh thu theo ngày
            var revenueByDate = orderDetails
                .GroupBy(x => DateOnly.FromDateTime(x.Order.CreatedAt))
                .Select(g => new ResponseSaleCampaignRevenueDate
                {
                    Date = g.Key.ToDateTime(TimeOnly.MinValue),
                    Revenue = g.Sum(x => x.PriceAtTime)
                })
                .OrderBy(x => x.Date)
                .ToList();

            // Nhóm sản phẩm trong chiến dịch
            var productStatistic = orderDetails
       .GroupBy(x => x.ProductVariant.ProductColor.ProductId)
       .Select(g => new ResponseProductInSaleCampaignStatistic
       {
           ProductID = g.Key,
           ProductName = g.First().ProductVariant.ProductColor.Product.ProductName,
           ImageUrl = g.First().ProductVariant.ProductColor.Product.MainImageUrl,
           TotalSoldQuantity = g.Sum(x => x.Quantity),

           // 🔹 Lấy chi tiết từng variant trong sản phẩm
           ListResponseProductVariant = g.GroupBy(v => v.ProductVariantId)
               .Select(vg => new ResponseVariantInSaleCampaignStatistic
               {
                   ProductVariantId = vg.Key,
                   ProductVariantName = vg.First().ProductVariant.VariantName,
                   SoldQuantity = vg.Sum(x => x.Quantity),
                   ImageUrl = vg.First().ProductVariant.ImageUrl
               })
               .ToList()
       })
       .OrderByDescending(x => x.TotalSoldQuantity)
       .ToList();


            // Kết quả trả về
            return new ResponseSaleCampaignStatistic
            {
                TotalRevenue = totalRevenue,
                TotalSoldQuantity = totalSoldQuantity,
                AverageRevenuePerDate = Math.Round(avgRevenue, 2),
                ListProductInCampaign = productStatistic,
                ListSaleRevenueDate = revenueByDate
            };
        }

    }

}
