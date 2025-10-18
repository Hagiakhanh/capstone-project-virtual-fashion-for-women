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
    catch (error: any) {
        return NextResponse.json({
            message: "Lấy dữ liệu thất bại: " + error.response.data.message,
        }, { status: 400 });
    }

}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post('/cart/add-item', payload)
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
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
    catch (error: any) {
        return NextResponse.json({
            message: "Lỗi cập nhật thất bại: " + error.response.data.message,
        }, { status: 400 });
    }
}

