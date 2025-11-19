using System.Data.SqlTypes;
using System.Globalization;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class DashboardService : IDashboardService
{
    private readonly IOrderDetailRepository _orderDetailRepository;

    public DashboardService(IOrderDetailRepository orderDetailRepository)
    {
        _orderDetailRepository = orderDetailRepository;
    }
    
    public async Task<ResponseSystemStatistic> GetSystemWideStatistic(
        DateOnly? startDate, 
        DateOnly? endDate,
        StatisticGroupingEnum? grouping) // Thêm tham số grouping
    {
        // --- 1. Xử lý ngày (đã sửa lỗi SqlDateTime) ---
        if (startDate.HasValue && endDate.HasValue && endDate.Value < startDate.Value)
        {
            throw new ArgumentException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
        }
        
        DateTime actualStart = startDate?.ToDateTime(TimeOnly.MinValue) ?? (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue;
        DateTime actualEnd = endDate?.ToDateTime(TimeOnly.MaxValue) ?? DateTime.UtcNow;
        
        var allOrderDetails = await _orderDetailRepository.GetOrderDetailsForSystemStatisticAsync(actualStart, actualEnd);

        if (allOrderDetails == null || !allOrderDetails.Any())
        {
            // Trả về rỗng (cập nhật DTO mới)
            return new ResponseSystemStatistic
            {
                TotalGrossRevenue = 0, TotalRefundAmount = 0, TotalOrders = 0, TotalRefunds = 0,
                TotalNetRevenue = 0, TotalNetSoldQuantity = 0, AverageRevenuePerDate = 0,
                TopCategories = new List<ResponseCategoryStatistic>(),
                TopProducts = new List<ResponseProductStatistic>(),
                RevenueByPeriod = new List<ResponseRevenueByTime>()
            };
        }

        // --- 2. Định nghĩa hàm nhóm thời gian ---
        // (Dùng để nhóm doanh thu theo Tuần/Tháng/Năm)
        Func<DateTime, (string Period, DateTime SortableDate)> groupingFunc;
        
        switch (grouping)
        {
            case StatisticGroupingEnum.Week:
                groupingFunc = dt => {
                    // Lấy năm và tuần theo chuẩn ISO (quan trọng cho các ngày cuối/đầu năm)
                    int isoYear = ISOWeek.GetYear(dt);
                    int isoWeekNum = ISOWeek.GetWeekOfYear(dt);
                    // Dùng ToDateTime để lấy ngày Thứ Hai của tuần ISO đó
                    DateTime firstDayOfWeek = ISOWeek.ToDateTime(isoYear, isoWeekNum, DayOfWeek.Monday);
            
                    return ($"Tuần {isoWeekNum}/{isoYear}", firstDayOfWeek);
                };
                break;
            case StatisticGroupingEnum.Month:
                groupingFunc = dt => (dt.ToString("MM/yyyy"), new DateTime(dt.Year, dt.Month, 1));
                break;
            case StatisticGroupingEnum.Year:
                groupingFunc = dt => (dt.Year.ToString(), new DateTime(dt.Year, 1, 1));
                break;
            case StatisticGroupingEnum.Day:
            default:
                groupingFunc = dt => (dt.ToString("yyyy-MM-dd"), dt.Date);
                break;
        }

        // --- 3. Xử lý dữ liệu (Tính toán) ---
        var validStatus = new[] { OrderStatusEnum.Completed.ToString() };

        // Dùng Dictionary để tổng hợp (đã cập nhật)
        var revenueByPeriod = new Dictionary<string, (decimal NetRevenue, DateTime SortableDate)>();
        var productStats = new Dictionary<string, (ResponseProductStatistic Stat, Dictionary<string, ResponseVariantStatistic> Variants)>();
        var categoryStats = new Dictionary<int, ResponseCategoryStatistic>();

        // Biến tổng hợp mới
        decimal totalGrossRevenue = 0;
        decimal totalRefundAmountAgg = 0; // Tổng tiền refund
        decimal totalNetRevenue = 0;
        int totalNetSoldQuantity = 0;
        
        // Dùng HashSet để đếm số đơn hàng duy nhất
        var completedOrderIds = new HashSet<int>();
        var refundedOrderIds = new HashSet<int>(); // Đơn hàng có refund (đã completed)

        var validOrderDetails = allOrderDetails.Where(od => validStatus.Contains(od.Order.Status));

        foreach (var od in validOrderDetails)
        {
            // --- Tính toán Doanh thu/Refund ---
            decimal grossRevenue = od.Quantity * od.PriceAtTime;
            int grossQuantity = od.Quantity;

            decimal totalRefundAmountOnDetail = od.OrderRefundDetails
                .Where(ord => ord.OrderRefund.Status == OrderRefundStatusEnum.Completed.ToString())
                .Sum(ord => ord.Quantity * ord.RefundPriceAtTime);
            
            int totalRefundQuantityOnDetail = od.OrderRefundDetails
                .Where(ord => ord.OrderRefund.Status == OrderRefundStatusEnum.Completed.ToString())
                .Sum(ord => ord.Quantity);

            decimal netRevenue = grossRevenue - totalRefundAmountOnDetail;
            int netQuantity = grossQuantity - totalRefundQuantityOnDetail;
            netQuantity = Math.Max(0, netQuantity);
            
            // --- Cập nhật biến tổng ---
            totalGrossRevenue += grossRevenue;
            totalRefundAmountAgg += totalRefundAmountOnDetail;
            totalNetRevenue += netRevenue;
            totalNetSoldQuantity += netQuantity;

            // Đếm số đơn hàng
            completedOrderIds.Add(od.OrderId);
            if (totalRefundAmountOnDetail > 0)
            {
                refundedOrderIds.Add(od.OrderId);
            }

            // --- Cập nhật doanh thu theo kỳ (Tuần/Tháng/Năm) ---
            var groupKey = groupingFunc(od.Order.CreatedAt);
            if (!revenueByPeriod.ContainsKey(groupKey.Period))
            {
                revenueByPeriod[groupKey.Period] = (0, groupKey.SortableDate);
            }
            // Cộng dồn doanh thu ròng
            revenueByPeriod[groupKey.Period] = (
                revenueByPeriod[groupKey.Period].NetRevenue + netRevenue, 
                groupKey.SortableDate
            );

            // --- Thống kê Product/Category (chỉ khi có bán ròng) ---
            if (netQuantity > 0)
            {
                var product = od.ProductVariant.ProductColor.Product;
                var category = product.Category;
                var variant = od.ProductVariant;

                // Cập nhật Product Stats
                if (!productStats.ContainsKey(product.ProductId))
                {
                    productStats[product.ProductId] = (
                        new ResponseProductStatistic {
                            ProductID = product.ProductId,
                            ProductName = product.ProductName,
                            ImageUrl = product.MainImageUrl,
                            TotalRevenue = 0, TotalSoldQuantity = 0,
                            ListResponseVariant = new List<ResponseVariantStatistic>()
                        },
                        new Dictionary<string, ResponseVariantStatistic>()
                    );
                }
                var currentProductStat = productStats[product.ProductId];
                currentProductStat.Stat.TotalRevenue += netRevenue;
                currentProductStat.Stat.TotalSoldQuantity += netQuantity;

                // Cập nhật Variant Stats
                if (!currentProductStat.Variants.ContainsKey(variant.ProductVariantId))
                {
                    currentProductStat.Variants[variant.ProductVariantId] = new ResponseVariantStatistic {
                        ProductVariantId = variant.ProductVariantId,
                        ProductVariantName = variant.VariantName,
                        ImageUrl = variant.ImageUrl,
                        SoldQuantity = 0
                    };
                }
                currentProductStat.Variants[variant.ProductVariantId].SoldQuantity += netQuantity;

                // Cập nhật Category Stats
                if (category != null) 
                {
                    if (!categoryStats.ContainsKey(category.CategoryId))
                    {
                        categoryStats[category.CategoryId] = new ResponseCategoryStatistic {
                            CategoryId = category.CategoryId,
                            CategoryName = category.CategoryName,
                            TotalRevenue = 0, TotalSoldQuantity = 0
                        };
                    }
                    categoryStats[category.CategoryId].TotalRevenue += netRevenue;
                    categoryStats[category.CategoryId].TotalSoldQuantity += netQuantity;
                }
            }
        }

        // --- 4. Hoàn thiện kết quả ---
        
        // Tính số ngày (dùng cho doanh thu trung bình)
        int totalDays = 1;
        if (startDate.HasValue && endDate.HasValue) {
            totalDays = (endDate.Value.DayNumber - startDate.Value.DayNumber) + 1;
        } 
        else if (revenueByPeriod.Any()) {
            var minDate = revenueByPeriod.Values.Min(v => v.SortableDate);
            var maxDate = revenueByPeriod.Values.Max(v => v.SortableDate);
            // Cần điều chỉnh logic maxDate cho đúng, tùy theo cách nhóm
            // Tạm thời vẫn dùng logic cũ cho đơn giản
            totalDays = (DateOnly.FromDateTime(actualEnd).DayNumber - DateOnly.FromDateTime(minDate).DayNumber) + 1;
        }
        
        decimal avgRevenue = totalDays > 0 ? totalNetRevenue / totalDays : totalNetRevenue;

        // Chuyển đổi Dictionaries sang Lists
        var finalProductList = productStats.Values.Select(ps => {
                ps.Stat.ListResponseVariant = ps.Variants.Values.OrderByDescending(v => v.SoldQuantity).ToList();
                return ps.Stat;
            })
            .OrderByDescending(p => p.TotalSoldQuantity)
            .ToList();

        var finalCategoryList = categoryStats.Values
            .OrderByDescending(c => c.TotalSoldQuantity)
            .ToList();

        // Chuyển đổi Doanh thu theo kỳ
        var finalRevenueByPeriod = revenueByPeriod
            .Select(kvp => new ResponseRevenueByTime { 
                Period = kvp.Key, 
                NetRevenue = kvp.Value.NetRevenue, 
                SortableDate = kvp.Value.SortableDate 
            })
            .OrderBy(r => r.SortableDate)
            .ToList();

        // --- 5. Trả về kết quả (đầy đủ) ---
        return new ResponseSystemStatistic
        {
            // Số liệu mới
            TotalGrossRevenue = totalGrossRevenue,
            TotalRefundAmount = totalRefundAmountAgg,
            TotalOrders = completedOrderIds.Count,
            TotalRefunds = refundedOrderIds.Count,

            // Số liệu ròng
            TotalNetRevenue = totalNetRevenue,
            TotalNetSoldQuantity = totalNetSoldQuantity,
            AverageRevenuePerDate = Math.Round(avgRevenue, 0),

            // Danh sách chi tiết
            TopCategories = finalCategoryList,
            TopProducts = finalProductList,
            RevenueByPeriod = finalRevenueByPeriod
        };
    }
}