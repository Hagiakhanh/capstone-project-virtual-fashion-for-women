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
        public static string BuildAskQuestionCategoryHint(List<Category> listCategory)
        {
            if (listCategory == null || listCategory.Count == 0)
                return "Hiện chỉ có các loại sản phẩm cơ bản để gợi ý.";

            // Lấy tên các loại sản phẩm (đầm, váy, quần, áo thun, ...)
            var itemNames = listCategory
                .Select(c => c.CategoryName.Trim())
                .Distinct()
                .ToList();

            // Ghép danh sách tự nhiên: "đầm, váy, quần và áo thun"
            string joinedNames = string.Join(", ", itemNames.Take(itemNames.Count - 1))
                + (itemNames.Count > 1 ? " và " + itemNames.Last() : itemNames.First());

            var sb = new StringBuilder();
            sb.AppendLine("**QUY TẮC HỎI GỢI Ý KHI `ask_question`:**");
            sb.AppendLine($"- Chỉ được hỏi hoặc đề xuất trong phạm vi các loại sản phẩm hiện có: {joinedNames}.");
            sb.AppendLine($"- Không được hỏi, gợi ý hoặc tạo ra các loại ngoài danh mục này (ví dụ: đồ bơi, bikini, tankini...).");
            sb.AppendLine($"- Nếu người dùng nói đến loại sản phẩm không nằm trong danh mục, hãy lịch sự giải thích rằng hiện chỉ hỗ trợ {joinedNames} thôi.");
            sb.AppendLine($"- Khi đặt câu hỏi, nên hỏi tự nhiên, ví dụ: “Bạn muốn tìm {joinedNames} ạ?”.");

            sb.AppendLine("**QUY TẮC XÁC ĐỊNH `ItemType`:**");
            sb.AppendLine($"- Khi tạo hoặc cập nhật `ItemType` trong `updatedStyle`, bạn chỉ được phép sử dụng các giá trị nằm trong danh mục hiện có: {joinedNames}.");
            sb.AppendLine($"- Tuyệt đối KHÔNG được sinh ra các loại ngoài danh mục (ví dụ: đồ bơi, bikini, áo khoác, tankini...).");
            sb.AppendLine($"- Nếu người dùng đề cập đến sản phẩm không nằm trong danh mục, bạn phải phản hồi lịch sự rằng hiện chỉ hỗ trợ {joinedNames}.");
            sb.AppendLine($"- `ItemType` PHẢI khớp chính xác với `CategoryName` được cung cấp. Không tự ý viết khác chính tả hoặc biến thể (ví dụ: 'váy ngắn' phải quy về 'Váy' theo đúng các loại của {joinedNames} ).");
            sb.AppendLine($"- Nếu người dùng chỉ muốn một loại, chỉ điền `ItemType` tương ứng đó. Nếu muốn phối nhiều loại, có thể thêm nhiều phần tử trong `components` theo danh mục này.");


            return sb.ToString();
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
- **Số đo 3 vòng (`Bust`, `Waist`, `Hips`)** cũng cần được chuẩn hóa về đơn vị **centimét (cm)**:
    - **`Bust`**: vòng ngực, giá trị số nguyên (ví dụ: “vòng 1 là 85”, “ngực 90” → `Bust = 85` hoặc `90`).
    - **`Waist`**: vòng eo, giá trị số nguyên (ví dụ: “eo 60”, “vòng hai 58” → `Waist = 60` hoặc `58`).
    - **`Hips`**: vòng hông, giá trị số nguyên (ví dụ: “hông 90”, “vòng ba 95” → `Hips = 90` hoặc `95`).
- Nếu người dùng cung cấp cả ba số đo (“85-60-90”, “vòng một 85, eo 60, hông 90”), bạn PHẢI ghi đầy đủ ba trường `Bust`, `Waist`, `Hips` vào `updatedStyle`.
- Nếu người dùng chỉ cung cấp một hoặc hai số đo phải yêu cầu người dùng nhập cho đủ thông tin số đo của 3 vòng.
- Nếu người dùng nói bỏ qua, không xét số đo, hoặc yêu cầu không lưu thông tin cá nhân, bạn PHẢI đặt `Bust`, `Waist`, `Hips` = `null`.
    - **QUY TẮC XÓA THÔNG TIN: Nếu người dùng yêu cầu bỏ qua hoặc không xét đến một thông tin nào đó (ví dụ: 'khỏi cần cân nặng của mình'), bạn PHẢI đặt giá trị của trường tương ứng trong `updatedStyle` thành `null`.**

2.  Dựa vào đối tượng JSON **đã được cập nhật**, quyết định hành động: `ask_question` hoặc `provide_suggestions`.
2.  Dựa vào đối tượng JSON **đã được cập nhật**, hãy quyết định 1 trong 2 hành động (`action`):
    - `ask_question`: Nếu bạn vẫn cần thêm thông tin (chưa có `FashionStyle` hoặc `ItemType`).
    -   `provide_suggestions`: Nếu bạn đã có đủ thông tin (`FashionStyle` VÀ `ItemType`). Hãy tạo kế hoạch phối đồ.
3.  Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất, có các trường: `action`, `updatedStyle`, `outfitName`, `components`, `responseText`.

Đây là danh sách các category hợp lệ để mapping với itemType:
{BuildAskQuestionCategoryHint(listCategory)}

**QUY TẮC BẮT BUỘC VỀ quyết định ra loại ItemType nào (HARD RULE):**
- Nếu người dùng yêu cầu một sản phẩm KHÔNG tồn tại trong danh sách category được cung cấp, bạn TUYỆT ĐỐI KHÔNG được:
  - Tự tạo ItemType mới
  - Đoán gần đúng
  - Cố suy diễn sang category khác

- Trong trường hợp này, bạn PHẢI:
  1. Set `ItemType = null`
  2. action = ""ask_question""
  3. responseText phải lịch sự thông báo sản phẩm đó không có trong hệ thống và đề nghị người dùng chọn lại từ danh sách hợp lệ.

QUY TẮC PHONG CÁCH VÀ NGỮ CẢNH (LOGIC RULES)
- `FashionStyle` và `Occasion` phải phù hợp với nhau. Không được tạo các tổ hợp phi lý như 'đi biển công sở', 'thể thao dự tiệc', 'dạo phố văn phòng'.
- Khi hỏi về `FashionStyle`, chỉ được gợi ý trong phạm vi các phong cách hợp lệ (ví dụ: công sở, dạo phố, đi biển, dự tiệc...). 
- Không được tự thêm hoặc mở rộng sang kiểu dáng sản phẩm như maxi, suông, chữ A, bodycon...

Nếu người dùng nhập hai thông tin xung đột, hãy ưu tiên `FashionStyle` và điều chỉnh `Occasion` sao cho hợp lý.
 Một số quy tắc tương thích gợi ý:
`FashionStyle`: 'công sở' → `Occasion` nên là 'đi làm', 'gặp khách hàng', 'phỏng vấn'...
`FashionStyle`: 'đi biển' → `Occasion` nên là 'nghỉ dưỡng', 'du lịch', 'chụp ảnh biển'...
 `FashionStyle`: 'dự tiệc' → `Occasion` nên là 'tiệc cưới', 'sự kiện', 'hẹn hò'...
Nếu không chắc, hãy hỏi lại người dùng để làm rõ thay vì tự kết hợp.
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
  ""updatedStyle"": {{ ""Occasion"": ""đi tiệc"", ""FashionStyle"": ""cách tân"", ""ItemType"": ""Đầm"", ""Color"": ""đỏ""}},
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
                        $"- Id: {pv.ProductVariantId}, Tên: {pv.VariantName}, Màu: {pv.ProductColor.Color.ColorName}, Size: {pv.Size.SizeCode}, ImageUrl: {pv.ImageUrl}, ProductId: {pv.ProductColor.ProductId}, ProductSlug: {pv.ProductColor.Product.ProductSlug}, ProductColor:{pv.ProductColor.ProductColorId}"
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
    {{ ""id"": ..., ""name"": ...,""ImageUrl"":...,""productId"":..., ""productSlug"":..., ""productColorID"":..., ""reason"": ""{textSuggestion}: giải thích ngắn tại sao phù hợp"" }}
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