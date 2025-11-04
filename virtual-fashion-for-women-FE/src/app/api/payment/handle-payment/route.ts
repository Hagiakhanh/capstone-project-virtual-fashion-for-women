import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const api = createApiInstance(request);
        const responseBE = await api.post("/payment/handle-transaction-status-with-momo-method");
        if (responseBE.status === 200) {
            return NextResponse.json({ status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message,
            { status: 400 }
        );
    }
}