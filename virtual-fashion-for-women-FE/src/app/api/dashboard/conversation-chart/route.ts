import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);

        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const response = await api.get("/dashboard/conversation-chart", {
            params: {
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            },
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching conversation chart:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}