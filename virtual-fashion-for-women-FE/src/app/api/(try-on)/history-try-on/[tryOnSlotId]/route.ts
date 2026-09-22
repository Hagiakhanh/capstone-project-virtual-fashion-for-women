import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request,
    { params }: { params: Promise<{ tryOnSlotId: string }> }) {
    const { tryOnSlotId } = await params;
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get(`/try-on-slot/history-try-on-slot/${parseInt(tryOnSlotId)}`);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || {};
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}