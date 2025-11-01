import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
    const { notificationId } = await params;
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get(`/notification/${parseInt(notificationId)}`);
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
