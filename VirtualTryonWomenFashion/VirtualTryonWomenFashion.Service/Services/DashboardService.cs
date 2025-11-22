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

    public DashboardService(IOrderDetailRepository orderDetailRepository,
        IOrderRepository orderRepository,
        IUserRepository userRepository,
        IOrderRefundRepository orderRefundRepository,
        ITransactionRepository transactionRepository)
    {
        _orderDetailRepository = orderDetailRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _orderRefundRepository = orderRefundRepository;
        _transactionRepository = transactionRepository;
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
}