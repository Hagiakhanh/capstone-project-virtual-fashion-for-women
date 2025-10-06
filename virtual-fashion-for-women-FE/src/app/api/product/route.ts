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

export async function GET(request: NextRequest) {
    try {
        //const payload: typeRequestListProduct = await request.json();
        const { searchParams } = new URL(request.url);
        const PageIndex = searchParams.get('PageIndex');
        const PageSize = searchParams.get('PageSize');
        const ProductSort = searchParams.get('ProductSort');

        const api = createApiInstance(request);
        const responseBE = await api.get('/product/search', {
            params: {
                PageIndex: PageIndex,
                PageSize: PageSize,
                ProductSort: ProductSort
            }
        });
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
    } catch (error) {
        console.error("Error when calling list products:", error);
        return NextResponse.json({ message: "Lỗi không lấy được danh sách sản phẩm." }, { status: 500 });
    }
}
