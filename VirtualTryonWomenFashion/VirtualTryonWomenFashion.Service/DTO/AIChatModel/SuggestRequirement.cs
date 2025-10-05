using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.AIChatModel
{
    public class SuggestRequirement
    {
        public double? Height { get; set; }
        public double? Weight { get; set; }
        public string? FashionStyle { get; set; }

        // --- Các trường mở rộng để AI phân loại và query chính xác ---

        /// <summary>
        /// Loại sản phẩm người dùng đang hỏi. 
        /// AI sẽ điền vào đây: "váy", "đầm", "áo", "quần", hoặc "bộ đồ".
        /// </summary>
        public string? ItemType { get; set; }

        /// <summary>
        /// Dịp sử dụng trang phục.
        /// Ví dụ: "đi tiệc", "đi làm", "dạo phố".
        /// </summary>
        public string? Occasion { get; set; }

        /// <summary>
        /// Màu sắc nếu người dùng đề cập.
        /// </summary>
        public string? Color { get; set; }
    }
    public class OutfitDTO
    {
        public string OutfitName { get; set; }
        public string ResponseText { get; set; }
        public List<ProductSuggestionDTO> Components { get; set; } = new List<ProductSuggestionDTO>();
    }

    public class ProductSuggestionDTO
    {
        public int VarianceId { get; set; }
        public string ProductName { get; set; }
        public string ImageUrl { get; set; }
        public string Color { get; set; }
        public string Size { get; set; }
    }

    // DTO nội bộ để parse kế hoạch từ Gemini
    public class OutfitPlanResponse
    {
        /// <summary>
        /// Quyết định của AI: "ask_question" hoặc "provide_suggestions".
        /// </summary>
        public string Action { get; set; }

        /// <summary>
        /// Trạng thái yêu cầu của người dùng sau khi đã được AI cập nhật.
        /// </summary>
        public SuggestRequirement UpdatedStyle { get; set; }
        public string OutfitName { get; set; }
        public List<OutfitComponentPlan> Components { get; set; }
        public string ResponseText { get; set; }
    }

    public class OutfitComponentPlan
    {
        public string SearchQuery { get; set; }
        public Dictionary<string, object> Filters { get; set; }
    }
    // Bạn có thể tạo file này trong thư mục DTO
    public class MessageDTO
    {
        public string Content { get; set; }
        public string SenderType { get; set; } // "User" hoặc "AI"
        public DateTime CreatedAt { get; set; }
    }
}
