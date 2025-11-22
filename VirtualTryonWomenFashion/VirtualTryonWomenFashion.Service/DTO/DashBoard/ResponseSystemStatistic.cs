using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;

namespace VirtualTryonWomenFashion.Service.DTO.DashBoard;

public class ResponseBasicSystemIndicator
{
    // Tổng quan đơn hàng
    public int TotalProcessingOrders { get; set; } // Đơn hàng đang được xử lý (pending, confirmed, shipping)
    public int TotalRefundOrders { get; set; }     // Đơn hàng đang yêu cầu hoặc đang tiến hành hoàn tiền
    public int TotalCompletedOrders { get; set; }  // Tổng đơn hàng đã hoàn thành
    public int TotalRefundsCompleted { get; set; } // Tổng đơn hàng đã hoàn tiền xong

    // Tổng quan người dùng
    public int TotalCustomers { get; set; }        // Tổng số lượng khách hàng
    public int TotalStaffs { get; set; }           // Tổng số lượng nhân viên

    // Tổng quan tài chính
    public decimal TotalGrossRevenue { get; set; } // Tổng tiền hàng (trước hoàn tiền)
    public decimal TotalRefundAmount { get; set; } // Tổng tiền đã hoàn
    public decimal TotalNetRevenue { get; set; }   // Tổng doanh thu thuần (TotalGrossRevenue - TotalRefundAmount)
}

public class RevenueResult
{
    public string Label { get; set; } // "2025-01" hoặc "01/01/2025"
    public decimal TotalRevenue { get; set; }
}

public class RevenueFilterRequest
{
    public int? Year { get; set; }            // Chỉ truyền Year => group theo tháng
    public int? Month { get; set; }           // Chỉ truyền Month => gợi ý group theo ngày
    public DateTime? StartDate { get; set; }  // Khoảng ngày 
    public DateTime? EndDate { get; set; }    // Khoảng ngày
}

public class CategorySalesPieDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public int TotalSold { get; set; }
    public double Percentage { get; set; }  // % trên tổng số lượng đã bán
}
