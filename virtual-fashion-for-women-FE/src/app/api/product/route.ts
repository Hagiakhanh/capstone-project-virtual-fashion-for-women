import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function POST(request: NextRequest) {
    try {
        // Lấy FormData từ request gửi lên
        const formData = await request.formData();

        // Gọi sang backend bằng axios instance
        const api = createApiInstance(request);
        const responseBE = await api.post("/product", formData, {
        headers: {
            // Đừng set Content-Type ở đây,
            // axios sẽ tự set khi body là FormData
        },
        });

        // Backend trả dữ liệu
        const result = responseBE.data;

        return NextResponse.json(result, { status: responseBE.status });
    } catch (error: any) {
        console.error("Error when calling backend:", error?.message || error);

        return NextResponse.json(
        {
            message: `Lỗi kết nối đến backend: ${error.message}`,
            statusCode: 500,
        },
        { status: 500 }
        );
    }
}
