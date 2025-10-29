import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { lensId: string } }) {
    try {
        const { lensId } = await params;
        const api = await createApiInstance(request);
        const responseBE = await api.get(`/productcolor/by-lens-id/${lensId}`);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data.data;
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}