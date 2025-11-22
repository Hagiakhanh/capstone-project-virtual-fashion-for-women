import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const limit = searchParams.get("limit");
        const response = await api.get("/dashboard/top-try-on-product", {
            params: {
                start: start || undefined,
                end: end || undefined,
                limit: limit || undefined,
            },
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching top try-on products:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
