import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request,
    { params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get(`/order/customer/${parseInt(orderId)}`);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || {};
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        } else {
            return NextResponse.json(
                { message: `Lấy chi tiết đơn hàng ${orderId} thất bại` },
                { status: responseBE.data?.statusCode }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: `Lỗi khi lấy orderId ${orderId}: `, error },
            { status: 400 }
        )
    }
}