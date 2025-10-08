using System.Text;
using System.Text.Json;
using VirtualTryonWomenFashion.Data.Models;
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

        public static string BuildConversationalStylistPrompt(List<Message>? history, SuggestRequirement currentStyle, List<Category> listCategory, string newMessage)
        {
            var historyText = new StringBuilder();
            if (history != null)
            {
                foreach (var msg in history)
                {
                    historyText.AppendLine((msg.IsAiresponse ? "AI" : "User")
                    + $": {msg.Content}");
                }
            }
            StringBuilder textRuleCategories = new StringBuilder();
            textRuleCategories.AppendLine("**QUY TẮC LỌC KHI `provide_suggestions`:**");
            textRuleCategories.AppendLine("Phần thông tin người dùng cần như quần áo thì cần phải tách ra thành áo với quần theo category tôi cung cấp dưới đây ở component khi gợi ý ra." +
                " Còn người dùng nếu chỉ muốn một loại thì chỉ lấy ra một loại thôi.");

            foreach (Category cat in listCategory)
            {
                textRuleCategories.AppendLine(
                    $"-   Tìm '{cat.CategoryName}': `\"filters\": {{ \"bodyPart\": \"{cat.BodyPart}\", \"itemType\": \"{cat.CategoryName}\" }}`"
                );
            }
            string currentStyleJson = JsonSerializer.Serialize(currentStyle);

            return $@"Bạn là một Stylist AI chuyên về thời trang nữ, nhiệm vụ của bạn là trò chuyện với người dùng để thu thập đủ thông tin trước khi đưa ra gợi ý.

**Mục tiêu của bạn:**
Điền thông tin vào đối tượng JSON `SuggestRequirement` bên dưới. Bạn cần ít nhất `FashionStyle`, `ItemType` để có thể đưa ra gợi ý.  Ngoài ra, nếu người dùng muốn cá nhân hoá theo chiều cao cân nặng của người dùng thì cần phải có đủ thông tin về `Height` hoặc `Weight`, bạn có thể lịch sự hỏi thêm để gợi ý chính xác hơn.

**Lịch sử trò chuyện:**
{historyText}

**Thông tin bạn đã biết về người dùng (SuggestRequirement):**
{currentStyleJson}

**Tin nhắn mới của người dùng:**
""{newMessage}""

**Nhiệm vụ của bạn:**
1.  Đọc tin nhắn mới và cập nhật thông tin vào đối tượng JSON `SuggestRequirement`.
    - **QUY TẮC CHUẨN HÓA DỮ LIỆU (BẮT BUỘC):** Khi cập nhật `Height` và `Weight`, bạn PHẢI chuẩn hóa tất cả các giá trị về đơn vị chuẩn:
        - **Chiều cao (`Height`)** phải là số nguyên tính bằng **centimét (cm)**. (Ví dụ: 'một mét rưỡi' -> 150, '1m6' -> 160).
        - **Cân nặng (`Weight`)** phải là số nguyên tính bằng **kilôgam (kg)**. (Ví dụ: 'nửa tạ' -> 50, '55 cân' -> 55).
    - **QUY TẮC XÓA THÔNG TIN: Nếu người dùng yêu cầu bỏ qua hoặc không xét đến một thông tin nào đó (ví dụ: 'khỏi cần cân nặng của mình'), bạn PHẢI đặt giá trị của trường tương ứng trong `updatedStyle` thành `null`.**

2.  Dựa vào đối tượng JSON **đã được cập nhật**, quyết định hành động: `ask_question` hoặc `provide_suggestions`.
2.  Dựa vào đối tượng JSON **đã được cập nhật**, hãy quyết định 1 trong 2 hành động (`action`):
    - `ask_question`: Nếu bạn vẫn cần thêm thông tin (chưa có `FashionStyle` hoặc `ItemType`).
    -   `provide_suggestions`: Nếu bạn đã có đủ thông tin (`FashionStyle` VÀ `ItemType`). Hãy tạo kế hoạch phối đồ.
3.  Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất, có các trường: `action`, `updatedStyle`, `outfitName`, `components`, `responseText`.
**QUY TẮC QUAN TRỌNG KHI `provide_suggestions`:**
- Trong `responseText`, bạn có đưa gợi ý thì sẽ trả về một nội dung chung chung như váy không cụ thể về tên chính xác của sản phẩm và đặc tính của nó quá chỉ nói theo đúng hướng mà người dùng hướng tới về phong cách hay mục tiêu mặc.
**LƯU Ý QUAN TRỌNG: Câu trả lời của bạn KHÔNG được chứa bất kỳ ký tự markdown nào, đặc biệt là dấu ```. Chỉ trả về đối tượng JSON thô.**

{textRuleCategories}

**LƯU Ý QUAN TRỌNG:**
-   `SearchQuery` vẫn cần phải đầy đủ để tìm kiếm ngữ nghĩa bao gồm các từ khoá về sản phẩm theo yêu cầu của người dùng, nhưng các thuộc tính quan trọng PHẢI được đưa vào `filters`.

**Ví dụ 1: Thiếu thông tin**
{{
  ""action"": ""ask_question"",
  ""updatedStyle"": {{ ""Occasion"": ""đi tiệc"", ""FashionStyle"": null }},
  ""responseText"": ""Đi tiệc thì tuyệt quá! Bạn thích phong cách sang trọng, quyến rũ hay dễ thương ạ?""
}}

**Ví dụ 2: Đủ thông tin (ÁP DỤNG QUY TẮC NÂNG CAO)**
User Request: ""Tìm cho mình một chiếc áo đầm cách tân màu đỏ để đi ăn cưới""
Your JSON output:
{{
  ""action"": ""provide_suggestions"",
  ""updatedStyle"": {{ ""Occasion"": ""đi tiệc"", ""FashionStyle"": ""cách tân"", ""ItemType"": ""Đầm"", ""Color"": ""đỏ"" }},
  ""outfitName"": ""Áo đầm tiệc sự kiện màu đỏ cách tân đi tiệc cho dịp đám cưới "",
  ""components"": [ 
    {{ 
      ""SearchQuery"": ""Đầm Maxi cách tân màu đỏ chất liệu lụa mềm mại cho dịp tiệc cưới"", 
      ""filters"": {{ 
        ""bodyPart"": ""Toàn thân"", 
        ""itemType"": ""Đầm"", 
        ""color"": ""đỏ""
      }} 
    }} 
  ],
  ""responseText"": ""Dịp đám cưới thì mặc áo dài là nhất rồi! Mình có gợi ý một chiếc áo dài rất duyên dáng cho bạn đây:""
}}

**Bây giờ, hãy xử lý yêu cầu:**
";
        }

        public static string BuildStylistReasoningPrompt(
    SuggestRequirement currentStyle,
    List<Category> listCategory,
     Dictionary<string, List<ProductVariant>> groupedOptions, string? textSuggestion)
        {
            // Convert dữ liệu sản phẩm lấy được từ vector DB thành JSON gọn
            var categoryRules = new StringBuilder();
            categoryRules.AppendLine("**QUY TẮC LỌC THEO CATEGORY:**");
            foreach (Category cat in listCategory)
            {
                categoryRules.AppendLine(
                    $"- '{cat.CategoryName}': `\"filters\": {{ \"bodyPart\": \"{cat.BodyPart}\", \"itemType\": \"{cat.CategoryName}\" }}`"
                );
            }

            string currentStyleJson = JsonSerializer.Serialize(currentStyle);

            // Gom dữ liệu sản phẩm theo nhóm
            var groupedBuilder = new StringBuilder();
            foreach (var kv in groupedOptions)
            {
                groupedBuilder.AppendLine($"Loại: {kv.Key}");
                foreach (var pv in kv.Value)
                {
                    groupedBuilder.AppendLine(
                        $"- Id: {pv.ProductVariantId}, Tên: {pv.VariantName}, Màu: {pv.ProductColor.Color.ColorName}, Size: {pv.Size.SizeCode}, ImageUrl: {pv.ImageUrl}"
                    );
                }
                groupedBuilder.AppendLine();
            }

            return $@"
Bạn là Stylist AI chuyên về thời trang nữ. 
Dưới đây là danh sách sản phẩm lấy từ vector database, đã được gom theo loại. 
Nhiệm vụ của bạn: reasoning và chọn **một sản phẩm duy nhất từ mỗi loại** để phối đồ, sao cho phù hợp nhất với yêu cầu của người dùng (`SuggestRequirement`).

**Thông tin người dùng (SuggestRequirement):**
{currentStyleJson}

**Danh sách sản phẩm (grouped theo loại):**
{groupedBuilder}

**Quy tắc reasoning:**
- Phải bám sát `SuggestRequirement` (phong cách, màu sắc, itemType, occasion).
- Mỗi loại chỉ chọn đúng 1 sản phẩm.
- Ưu tiên sản phẩm có độ phù hợp cao nhất (matching nhiều trường).
- Không tạo sản phẩm mới, chỉ chọn trong danh sách có sẵn.
- `SearchQuery` là câu ngắn gọn (ví dụ: ""áo sơ mi trắng công sở"").
- `filters` phải theo quy tắc bên dưới:

{categoryRules}

**Kết quả trả về:**
Một JSON duy nhất với các trường:
{{
  ""selectedProducts"": [
    {{ ""id"": ..., ""name"": ...,""ImageUrl"":..., ""reason"": ""{textSuggestion}: giải thích ngắn tại sao phù hợp"" }}
  ],
  ""responseText"": ""câu trả lời ngắn gọn, tự nhiên cho user""
}}

**Lưu ý:** 
- Chỉ trả về JSON, không markdown, không kèm giải thích thừa.
- Trong `reason`, giải thích ngắn gọn dựa trên sự khớp giữa sản phẩm và yêu cầu người dùng.
";
        }
    }

}