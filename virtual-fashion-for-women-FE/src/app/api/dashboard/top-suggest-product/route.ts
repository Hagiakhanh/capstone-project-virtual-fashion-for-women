import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const top = searchParams.get("top");
        const response = await api.get("/dashboard/top-suggest-product", {
            params: {
                start: start || undefined,
                end: end || undefined,
                top: top || undefined,
            },
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching top suggest products:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
