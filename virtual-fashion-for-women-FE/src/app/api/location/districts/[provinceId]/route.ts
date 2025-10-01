import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request,
    { params }: { params: Promise<{ provinceId: string }> }) {
    try {
        const { provinceId } = await params;
        const api = createApiInstance(request);
        const responseBE = await api.get(`/shipping/get-district/${parseInt(provinceId)}`)
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data;
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
    } catch (error) {
        return NextResponse.json({
            message: "Error fetching districts",
        }, { status: 400 });
    }

}