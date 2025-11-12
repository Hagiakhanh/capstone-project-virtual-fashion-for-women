using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.DashBoard;

public class ResponseRevenueByTime
{
    /// Kỳ thống kê (Vd: "2025-11-12", "Tuần 46/2025", "Tháng 11/2025", "2025")
    public string Period { get; set; }
    /// Doanh thu ròng của kỳ đó
    public decimal NetRevenue { get; set; }
    /// Dùng để sắp xếp (ẩn đi khi trả về JSON nếu muốn)
    public DateTime SortableDate { get; set; }
}

public class ResponseSystemStatistic
{
    public decimal TotalGrossRevenue { get; set; } // Tổng doanh thu gộp
    public decimal TotalRefundAmount { get; set; } // Tổng tiền đã hoàn
    public int TotalOrders { get; set; }           // Tổng số đơn hàng (đã Completed)
    public int TotalRefunds { get; set; }          // Tổng số đơn hàng có hoàn tiền (đã Completed)
    // --- Số liệu cũ (đã tính ròng) ---
    public decimal TotalNetRevenue { get; set; }     // Doanh thu ròng (Gross - Refund)
    public int TotalNetSoldQuantity { get; set; }  // Số lượng bán ròng (Sold - Refunded)
    public decimal AverageRevenuePerDate { get; set; }
    // --- Thống kê chi tiết ---
    public List<ResponseCategoryStatistic> TopCategories { get; set; }
    public List<ResponseProductStatistic> TopProducts { get; set; }
    public List<ResponseRevenueByTime> RevenueByPeriod { get; set; }
}

public class ResponseCategoryStatistic
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public int TotalSoldQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class ResponseProductStatistic
{
    public string ProductID { get; set; }
    public string ProductName { get; set; }
    public string ImageUrl { get; set; }
    public int TotalSoldQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<ResponseVariantStatistic> ListResponseVariant { get; set; }
}

public class ResponseVariantStatistic
{
    public string ProductVariantId { get; set; }
    public string ProductVariantName { get; set; }
    public int SoldQuantity { get; set; }
    public string ImageUrl { get; set; }
}
