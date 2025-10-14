import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post('/payment/create-payment', payload)

        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
        return NextResponse.json("Lỗi thanh toánthất bại", { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi thanh toán thất bại: " + error.response.data.message }, { status: 400 });
    }
}