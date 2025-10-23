import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";
import { typeRequestListProduct } from "@/types/product";
import { Search } from "lucide-react";

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

        const { searchParams } = new URL(request.url);
        const pageIndex = searchParams.get("pageIndex") || "1";
        const pageSize = searchParams.get("pageSize") || "10";
        const searchTerm = searchParams.get("searchTerm") || "";
        const status = searchParams.get("status") || "all";

        const response = await api.get("/product", {
          params: { pageIndex, pageSize, searchTerm, status },
        });
        if (response.status === 200) {
            const paginationHeader = response?.headers?.get('X-Pagination');
            if (paginationHeader) {
                const paginationMetadata = JSON.parse(paginationHeader);
                return NextResponse.json({
                data: response.data?.data,
                pagination: paginationMetadata
                }, { status: 200 });
            };
            return NextResponse.json({ data: response.data?.data }, { status: 200 });
        }

    //return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("❌ Lỗi khi gọi API backend:", error);

        return NextResponse.json(
            { message: error.response?.data?.message || "Failed to fetch products" },
            { status: error.response?.status || 500 }
        );
    }
}
