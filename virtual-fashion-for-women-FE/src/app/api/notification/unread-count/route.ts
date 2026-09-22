import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get(`notification/unread-count`);
        if (responseBE.status === 200) {
            return NextResponse.json(
                {
                    data: responseBE.data?.data || 0,
                },
                { status: responseBE.data?.statusCode }
            );
        }

    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}