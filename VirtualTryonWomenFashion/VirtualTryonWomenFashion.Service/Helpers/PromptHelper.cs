using System.Text;
using System.Text.Json;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public static class PromptHelper
    {
        /// <summary>
        /// Tạo câu truy vấn tìm kiếm ngữ nghĩa từ các thuộc tính đã được trích xuất.
        /// Hàm này nên là public để có thể gọi từ bên ngoài.
        /// </summary>
        public static string BuildVectorSearchQuery(SuggestRequirement style)
        {
            var queryBuilder = new StringBuilder();
            queryBuilder.Append("Gợi ý thời trang");

            if (!string.IsNullOrEmpty(style.FashionStyle))
            {
                queryBuilder.Append($" theo phong cách {style.FashionStyle}");
            }
            if (!string.IsNullOrEmpty(style.Occasion))
            {
                queryBuilder.Append($" để {style.Occasion}");
            }

            // Thêm thông tin về item type để query chính xác hơn
            if (!string.IsNullOrEmpty(style.ItemType))
            {
                queryBuilder.Append($", món đồ cần tìm là {style.ItemType}");
            }
            if (!string.IsNullOrEmpty(style.Color))
            {
                queryBuilder.Append($" với ưu tiên màu {style.Color}");
            }

            // Thêm thông tin người dùng nếu có
            if (style.Height.HasValue || style.Weight.HasValue)
            {
                queryBuilder.Append(" cho người");
                if (style.Height.HasValue)
                {
                    queryBuilder.Append($" cao khoảng {style.Height}cm");
                }
                if (style.Weight.HasValue)
                {
                    queryBuilder.Append($" nặng khoảng {style.Weight}kg");
                }
            }

            queryBuilder.Append(".");
            return queryBuilder.ToString();
        }

        public static string BuildConversationalStylistPrompt(List<MessageDTO> history, SuggestRequirement currentStyle, string newMessage)
        {
            var historyText = new StringBuilder();
            foreach (var msg in history)
            {
                // Giả sử SenderID = 0 là AI, khác 0 là User
                historyText.AppendLine($"{msg.SenderType}: {msg.Content}");
            }

            string currentStyleJson = JsonSerializer.Serialize(currentStyle);

            return $@"
Bạn là Stylist AI chuyên về thời trang nữ. Nhiệm vụ: cập nhật thông tin người dùng vào JSON `SuggestRequirement` và xuất ra **JSON duy nhất** theo cấu trúc:

{{
  ""action"": ""ask_question"" | ""provide_suggestions"",
  ""updatedStyle"": {{ ... }},
  ""components"": [
    {{
      ""SearchQuery"": ""<chuỗi từ khoá gọn, súc tích để query vector DB>"",
      filters"": {{ ... }}
    }}
  ],
  ""responseText"": ""<một câu trả lời ngắn, tự nhiên, nhưng chỉ cần để gợi mở hoặc xác nhận>""
}}

**Quy tắc:**
- Chỉ dùng JSON, không markdown, không giải thích thêm.
- `Height` chuẩn hóa thành cm (số nguyên), `Weight` chuẩn hóa thành kg (số nguyên).
- Nếu user bảo bỏ qua thông tin → gán `null`.
- `action = ask_question` nếu thiếu `FashionStyle` hoặc `ItemType`.
- `action = provide_suggestions` nếu đủ thông tin. Khi đó:
  - `SearchQuery` phải là từ khoá ngắn gọn (ví dụ: `""áo dài đỏ đi tiệc""`), không reasoning.
  - `filters` phải bám sát thông tin:
    - `""bodyPart""`: `""Thân trên""` (áo), `""Thân dưới""` (quần/váy), `""Nguyên bộ""` (đầm/áo dài).
    - Thêm `""item_type""`, `""color""`, `""style_tags""`, `""occasion""` nếu có.

**Lịch sử trò chuyện:**
{historyText}

**Thông tin hiện có (SuggestRequirement):**
{currentStyleJson}

**Tin nhắn mới của người dùng:**
""{newMessage}""

Hãy trả lời bằng JSON duy nhất.""
";
        }
    }
}