import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);
        const timeFilterType = searchParams.get("timeFilterType");
        const response = await api.get("/dashboard/category-pie", {
            params: {
                timeFilterType: timeFilterType || undefined,
            },
        });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching category sales pie:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
