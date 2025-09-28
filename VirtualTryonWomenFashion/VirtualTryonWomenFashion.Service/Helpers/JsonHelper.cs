using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public class JsonHelper
    {
        /// <summary>
        /// Làm sạch chuỗi JSON trả về từ AI, loại bỏ các ký tự Markdown (```) và các ký tự không hợp lệ khác.
        /// </summary>
        /// <param name="rawResponse">Chuỗi thô nhận được từ AI.</param>
        /// <returns>Một chuỗi JSON sạch, sẵn sàng để parse.</returns>
        public static string CleanJsonString(string rawResponse)
        {
            // Bước 1: Tìm vị trí của dấu ngoặc nhọn đầu tiên
            int startIndex = rawResponse.IndexOf('{');

            // Bước 2: Tìm vị trí của dấu ngoặc nhọn cuối cùng
            int endIndex = rawResponse.LastIndexOf('}');

            // Bước 3: Kiểm tra nếu không tìm thấy cặp ngoặc hợp lệ
            if (startIndex == -1 || endIndex == -1 || endIndex < startIndex)
            {
                // Trả về chuỗi gốc hoặc ném lỗi tùy vào cách bạn muốn xử lý
                throw new JsonException("Chuỗi trả về không chứa một đối tượng JSON hợp lệ.");
            }

            // Bước 4: Cắt chuỗi con từ đầu đến cuối đối tượng JSON
            return rawResponse.Substring(startIndex, endIndex - startIndex + 1);
        }

    }
}
