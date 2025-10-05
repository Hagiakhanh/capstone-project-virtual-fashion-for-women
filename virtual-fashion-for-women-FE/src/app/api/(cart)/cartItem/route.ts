import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET(request: Request) {
    try {

        const api = createApiInstance(request);
        const responseBE = await api.get('/cart')
        if (responseBE.status === 200) {
            const cartItems = responseBE.data?.data;
            return NextResponse.json(cartItems, { status: responseBE.data?.statusCode });
        }
    }
    catch (error) {
        console.error("Server login error", error);
        return NextResponse.json({
            message: "Lấy dữ liệu thất bại: " + error,
        }, { status: 400 });
    }

}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.put('/cart/update-quantity', payload)
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
        return NextResponse.json("Cập nhật thất bại", { status: 400 });
    }
    catch (error) {
        return NextResponse.json({
            message: "Lỗi cập nhật thất bại: " + error,
        }, { status: 400 });
    }
}

