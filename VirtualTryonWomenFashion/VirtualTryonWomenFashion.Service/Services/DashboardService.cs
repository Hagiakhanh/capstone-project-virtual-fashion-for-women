using System.Data.SqlTypes;
using System.Globalization;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class DashboardService : IDashboardService
{
    private readonly IOrderDetailRepository _orderDetailRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOrderRefundRepository _orderRefundRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ITryOnSlotRepository _tryOnSlotRepository;

    public DashboardService(IOrderDetailRepository orderDetailRepository,
        IOrderRepository orderRepository,
        IUserRepository userRepository,
        IOrderRefundRepository orderRefundRepository,
        ITransactionRepository transactionRepository,
        ICategoryRepository categoryRepository,
        ITryOnSlotRepository tryOnSlotRepository)
    {
        _orderDetailRepository = orderDetailRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _orderRefundRepository = orderRefundRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
        _tryOnSlotRepository = tryOnSlotRepository;
    }

    public async Task<ResponseBasicSystemIndicator> GetBasicSystemIndicators()
    {
        var allOrders = await _orderRepository.GetAllOrdersForBasicStatisticAsync();
        var allOrderRefunds = await _orderRefundRepository.GetAllOrderRefundsForBasicStatisticAsync();

        var processingStatuses = new[]
        {
            OrderStatusEnum.Pending.ToString(),
            OrderStatusEnum.Confirmed.ToString(),
            OrderStatusEnum.Packed.ToString(),
            OrderStatusEnum.Delivering.ToString(),
            OrderStatusEnum.Delivered.ToString()
        };
        int totalProcessingOrders = allOrders.Count(o => processingStatuses.Contains(o.Status));

        // Đơn hàng hoàn tiền/trả hàng
        var activeRefundStatuses = new[]
        {
            OrderRefundStatusEnum.Pending.ToString(),
            OrderRefundStatusEnum.Accepted.ToString(),
            OrderRefundStatusEnum.Delivering.ToString(),
            OrderRefundStatusEnum.Delivered.ToString(),
        };

        /*var refundingOrderStatuses = new[]
        {
            OrderStatusEnum.Returning.ToString(),
            OrderStatusEnum.Returned.ToString(),
        };*/
        //int totalProcessRefundOrders = allOrderRefunds.Count(o => activeRefundStatuses.Contains(o.Status));
        //int totalReturnOrders = allOrders.Count(o => refundingOrderStatuses.Contains(o.Status));
        int totalRefundOrders = allOrderRefunds.Count(o => activeRefundStatuses.Contains(o.Status));

        // Tổng đơn hàng đã hoàn thành (thu tiền thành công)
        int totalCompletedOrders = allOrders.Count(o =>
            o.Status == OrderStatusEnum.Completed.ToString());

        int totalRefundsCompleted = allOrderRefunds.Count(o =>
            o.Status == OrderRefundStatusEnum.Completed.ToString());

        // 1b. Tính toán Doanh thu và Hoàn tiền (chỉ tính trên OrderDetail)
        decimal totalGrossRevenue = await _transactionRepository.GetTotalTransactionAmounts(TypeTransactionEnum.Purchase.ToString());
        decimal totalRefundAmount = await _transactionRepository.GetTotalTransactionAmounts(TypeTransactionEnum.Refund.ToString());

        // Tổng doanh thu thuần
        decimal totalNetRevenue = totalGrossRevenue - totalRefundAmount;

        // --- 2. Thống kê Người dùng ---
        int totalCustomers = await _userRepository.GetTotalUsersByRoleAsync("Customer");
        int totalStaffs = await _userRepository.GetTotalUsersByRoleAsync("Staff");

        // --- 3. Trả về kết quả ---
        return new ResponseBasicSystemIndicator
        {
            TotalProcessingOrders = totalProcessingOrders,
            TotalRefundOrders = totalRefundOrders, // Tổng đơn hàng đang ở trạng thái Trả hàng/Hoàn tiền
            TotalCompletedOrders = totalCompletedOrders, // Tổng số đơn hàng đã Completed
            TotalRefundsCompleted = totalRefundsCompleted, // Tổng số đơn hàng đã hoàn tiền thành công

            TotalCustomers = totalCustomers,
            TotalStaffs = totalStaffs,

            TotalGrossRevenue = totalGrossRevenue,
            TotalRefundAmount = totalRefundAmount,
            TotalNetRevenue = Math.Round(totalNetRevenue, 2)
        };
    }

    private (DateTime Start, DateTime End) GetYearRange(int year)
    {
        var start = new DateTime(year, 1, 1);

        // Thời điểm cuối cùng của năm đó: start + 1 năm - 1 giây
        var end = start.AddYears(1).AddSeconds(-1);

        return (start, end);
    }

    private (DateTime Start, DateTime End) GetMonthRange(int year, int month)
    {
        var start = new DateTime(year, month, 1);

        // Thời điểm cuối cùng của tháng đó: start + 1 tháng - 1 giây
        var end = start.AddMonths(1).AddSeconds(-1);

        return (start, end);
    }

    private (DateTime Start, DateTime End) GetDateRange(DateTime startDate, DateTime endDate)
    {
        var start = startDate.Date;

        // Lấy hết ngày endDate → 23:59:59
        var end = endDate.Date.AddDays(1).AddSeconds(-1);

        return (start, end);
    }

    private decimal CalculateRevenue(IEnumerable<Transaction> group)
    {
        var purchase = group
            .Where(t => t.Type == TypeTransactionEnum.Purchase.ToString())
            .Sum(t => t.Money ?? 0);

        var refund = group
            .Where(t => t.Type == TypeTransactionEnum.Refund.ToString())
            .Sum(t => t.Money ?? 0);

        return purchase - refund;
    }

    public async Task<List<RevenueResult>> GetRevenueAsync(RevenueFilterRequest filter)
    {
        DateTime start, end;

        // ===== CASE 1: NĂM =====
        if (filter.Year.HasValue &&
            !filter.Month.HasValue &&
            !filter.StartDate.HasValue)
        {
            (start, end) = GetYearRange(filter.Year.Value);

            var transactions = await _transactionRepository.GetTransactionsInRangeAsync(start, end);

            return GenerateFilledPeriod(
                periodStart: start,
                periodEnd: end,
                labelFormat: "yyyy-MM",
                groupBy: t => new DateTime(t.CreatedAt.Year, t.CreatedAt.Month, 1),
                transactions: transactions
            );
        }

        // ===== CASE 2: THÁNG =====
        if (filter.Year.HasValue &&
            filter.Month.HasValue &&
            !filter.StartDate.HasValue)
        {
            (start, end) = GetMonthRange(filter.Year.Value, filter.Month.Value);

            var transactions = await _transactionRepository.GetTransactionsInRangeAsync(start, end);

            return GenerateFilledPeriod(
                periodStart: start,
                periodEnd: end,
                labelFormat: "dd/MM/yyyy",
                groupBy: t => t.CreatedAt.Date,
                transactions: transactions
            );
        }

        // ===== CASE 3: KHOẢNG NGÀY =====
        if (filter.StartDate.HasValue && filter.EndDate.HasValue)
        {
            (start, end) = GetDateRange(filter.StartDate.Value, filter.EndDate.Value);

            var transactions = await _transactionRepository.GetTransactionsInRangeAsync(start, end);

            return GenerateFilledPeriod(
                periodStart: start,
                periodEnd: end,
                labelFormat: "dd/MM/yyyy",
                groupBy: t => t.CreatedAt.Date,
                transactions: transactions
            );
        }

        return new List<RevenueResult>();
    }

    private List<RevenueResult> GenerateFilledPeriod(
        DateTime periodStart,
        DateTime periodEnd,
        string labelFormat,
        Func<Transaction, DateTime> groupBy,
        IEnumerable<Transaction> transactions)
    {
        // Tổng số ngày
        int totalDays = (periodEnd.Date - periodStart.Date).Days + 1;

        // Tạo list đầy đủ ngày/tháng
        var results = Enumerable.Range(0, totalDays)
            .Select(i =>
            {
                var date = periodStart.AddDays(i);

                // Nếu labelFormat = "yyyy-MM" → dùng đầu tháng
                if (labelFormat == "yyyy-MM")
                    date = new DateTime(date.Year, date.Month, 1);

                return new RevenueResult
                {
                    Label = date.ToString(labelFormat),
                    TotalRevenue = 0
                };
            })
            .GroupBy(r => r.Label)       // Tránh trùng khi dùng yyyy-MM
            .Select(g => g.First())
            .ToList();

        // Group giao dịch theo ngày/tháng
        var grouped = transactions.GroupBy(groupBy);

        foreach (var g in grouped)
        {
            string label = g.Key.ToString(labelFormat);

            var item = results.FirstOrDefault(x => x.Label == label);
            if (item != null)
                item.TotalRevenue = CalculateRevenue(g);
        }

        return results.OrderBy(x => x.Label).ToList();
    }

    public async Task<List<CategorySalesPieDto>> GetCategorySalesPieAsync(string timeFilterType)
    {
        // Truyền loại lọc vào hàm repository
        var data = await _categoryRepository.GetCategorySalesAsync(timeFilterType);

        if (data == null || !data.Any())
            return new List<CategorySalesPieDto>();

        // Tổng tất cả số lượng sản phẩm đã bán
        var totalSoldAll = data.Sum(x => x.TotalSold);

        // Tính % từng category
        var result = data
            .Select(x => new CategorySalesPieDto
            {
                CategoryId = x.CategoryId,
                CategoryName = x.CategoryName,
                TotalSold = x.TotalSold,
                Percentage = Math.Round((double)x.TotalSold / totalSoldAll * 100, 2)
            })
            .OrderByDescending(x => x.TotalSold)
            .ToList();

        return result;
    }

    public async Task<List<TopTryOnProductDto>> GetTopTryOnProductsAsync(
        DateTime? start, DateTime? end, int limit)
    {
        DateTime s = start ?? DateTime.UtcNow.AddHours(+7).AddDays(-7); // mặc định 7 ngày gần nhất
        DateTime e = end ?? DateTime.UtcNow.AddHours(+7);

        return await _tryOnSlotRepository.GetTopTryOnProductsAsync(s, e, limit);
    }

    public async Task<List<TryOnChartPointDto>> GetTryOnTimelineAsync(
        string productId, DateTime? start, DateTime? end)
    {
        DateTime s = start ?? DateTime.UtcNow.AddHours(+7).AddDays(-7);
        DateTime e = end ?? DateTime.UtcNow.AddHours(+7);

        return await _tryOnSlotRepository.GetTryOnTimelineAsync(productId, s, e);
    }

}