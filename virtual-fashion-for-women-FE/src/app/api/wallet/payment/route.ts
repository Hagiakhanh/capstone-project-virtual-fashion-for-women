import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post("/payment/pay-order-by-wallet", payload);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }

    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message,
            { status: 400 }
        );
    }

}