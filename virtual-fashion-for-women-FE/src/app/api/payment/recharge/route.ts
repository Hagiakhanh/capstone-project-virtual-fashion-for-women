import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post("/payment/create-recharge-payment", payload);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data.data, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message,
            { status: 400 }
        );
    }
}