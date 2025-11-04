import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.get(`/rating/all-product-rating/${productId}`);

        return NextResponse.json(responseBE.data, {
            status: responseBE.status,
        });
    } catch (error: any) {
        console.error("Error fetching rating:", error?.message || error);

        return NextResponse.json(
            {
                message: "Không thể lấy thông tin rating",
                details: error?.response?.data?.message || error?.message,
            },
            { status: error?.response?.status || 500 }
        );
    }
}