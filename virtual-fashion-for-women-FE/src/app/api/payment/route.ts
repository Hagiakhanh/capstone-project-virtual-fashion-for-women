import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        // console.log("Forwarded headers:", request.headers);
        console.log("api :", api)
        const responseBE = await api.post('/payment/create-payment', payload)
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
        return NextResponse.json("Checkout thất bại", { status: 400 });
    } catch (error) {
        console.error("Payment error", error);
        return NextResponse.json({ message: 'Lỗi không thanh toán được' }, { status: 400 });
    }
}