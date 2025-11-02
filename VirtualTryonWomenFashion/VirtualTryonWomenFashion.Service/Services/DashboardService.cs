using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class DashboardService : IDashboardService
{
    private readonly IOrderDetailRepository _orderDetailRepository;

    public DashboardService(IOrderDetailRepository orderDetailRepository)
    {
        _orderDetailRepository = orderDetailRepository;
    }
    
    /// <summary>
    /// Lấy top N sản phẩm bán chạy nhất, có thể lọc theo thời gian và danh mục.
    /// </summary>
    public async Task<List<BestSellingProductDto>> GetBestSellingProductsAsync(
        int topN = 5, 
        DateTime? startDate = null, 
        DateTime? endDate = null, 
        int? categoryId = null,
        bool includeDeletedProducts = false)
    {
        var completedStatuses = new List<string> { "Delivered", "Completed" };

        var query = (await _orderDetailRepository.GetAllOrderDetailsAsync())
            .Where(od => completedStatuses.Contains(od.Order.Status));

        if (startDate.HasValue)
        {
            query = query.Where(od => od.Order.CreatedAt >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            var inclusiveEndDate = endDate.Value.Date.AddDays(1);
            query = query.Where(od => od.Order.CreatedAt <= inclusiveEndDate);
        }

        var groupedQuery = query.GroupBy(od => od.ProductVariant.ProductColor.Product);

        if (categoryId.HasValue)
        {
            groupedQuery = groupedQuery.Where(g => g.Key.CategoryId == categoryId.Value);
        }

        // 5. Lọc sản phẩm đã xóa
        if (!includeDeletedProducts)
        {
            groupedQuery = groupedQuery.Where(g => g.Key.IsDeleted == false);
        }

        var bestSellingProducts = groupedQuery
            .Select(g => new BestSellingProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                MainImageUrl = g.Key.MainImageUrl,
                TotalQuantitySold = g.Sum(od => od.Quantity)
            })
            .OrderByDescending(p => p.TotalQuantitySold)
            .Take(topN)
            .ToList();

        return bestSellingProducts;
    }
    
    public async Task<List<BestSellingCategoryDto>> GetBestSellingCategoriesAsync(
        int topN = 4, 
        DateTime? startDate = null, 
        DateTime? endDate = null, 
        string sortBy = "quantity", 
        string sortOrder = "desc")
    {
        var completedStatuses = new List<string> { "Delivered", "Completed" };

        var query = (await _orderDetailRepository.GetAllOrderDetailsAsync())
            .Where(od => completedStatuses.Contains(od.Order.Status));

        if (startDate.HasValue)
        {
            query = query.Where(od => od.Order.CreatedAt >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            // Thêm 1 ngày để bao gồm cả ngày kết thúc (ví dụ: endDate là 31/10 thì sẽ lấy đến 23:59:59)
            var inclusiveEndDate = endDate.Value.Date.AddDays(1);
            query = query.Where(od => od.Order.CreatedAt < inclusiveEndDate);
        }

        var groupedQuery = query
            .Where(od => od.ProductVariant.ProductColor.Product.Category != null)
            .GroupBy(od => od.ProductVariant.ProductColor.Product.Category);

        var selection = groupedQuery.Select(g => new BestSellingCategoryDto
        {
            CategoryId = g.Key.CategoryId,
            CategoryName = g.Key.CategoryName,
            TotalQuantitySold = g.Sum(od => od.Quantity),
            TotalRevenue = g.Sum(od => od.Quantity * od.PriceAtTime)
        });

        bool isDescending = sortOrder.ToLower() == "desc";

        if (sortBy.ToLower() == "revenue")
        {
            selection = isDescending 
                ? selection.OrderByDescending(c => c.TotalRevenue) 
                : selection.OrderBy(c => c.TotalRevenue);
        }
        else // Mặc định sắp xếp theo 'quantity'
        {
            selection = isDescending 
                ? selection.OrderByDescending(c => c.TotalQuantitySold) 
                : selection.OrderBy(c => c.TotalQuantitySold);
        }

        return selection.Take(topN).ToList();
    }
}