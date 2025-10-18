export function mapTryOnCode(code: string | number): string {
    const messages: Record<string, string> = {
        "410001": "Người trong ảnh hơi nhỏ. Vui lòng cắt ảnh để có kết quả tốt hơn.",
        "410002": "Tư thế của người mẫu chưa được xác định. Vui lòng đảm bảo người mẫu đứng thẳng.",
        "410003": "Tư thế của người mẫu có thể không được hỗ trợ. Vui lòng đảm bảo người mẫu đứng thẳng.",
        "400001": "Không phát hiện thấy người nào trong hình ảnh.",
        "400002": "Có nhiều hơn một người được phát hiện trong hình ảnh.",
        "400003": "Người đó không hướng về phía trước.",
        "400004": "Người trong hình ảnh quá nhỏ."
    };

    return messages[String(code)] ?? "Lỗi không xác định.";
}
