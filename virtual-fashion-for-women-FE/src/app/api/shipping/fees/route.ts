import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get(`/shipping-region`);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: "Lấy phí giao hàng thất bại: " + error.response.data.message,
        }, { status: 400 });
    }
}