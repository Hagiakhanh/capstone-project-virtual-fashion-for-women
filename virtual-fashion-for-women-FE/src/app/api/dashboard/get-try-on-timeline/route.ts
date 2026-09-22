import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const response = await api.get("/dashboard/get-try-on-timeline", {
            params: {
                productId: productId || undefined,
                start: start || undefined,
                end: end || undefined,
            },
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching try-on timeline:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
