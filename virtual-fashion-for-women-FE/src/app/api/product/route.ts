import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";
import { typeRequestListProduct } from "@/types/product";

export async function POST(request: NextRequest) {
    try {
        // Lấy FormData từ request gửi lên
        const formData = await request.formData();

        // Gọi sang backend bằng axios instance
        const api = createApiInstance(request);
        const responseBE = await api.post("/product", formData, {
            headers: {
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

export async function GET(request: NextRequest) {
    try {
        const api = createApiInstance(request);
        const response = await api.get('/product');
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
          { message: error.response?.data?.message || 'Failed to fetch products' },
          { status: error.response?.status || 500 }
        );
    }
}
