import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const { searchParams } = new URL(request.url);

        const year = searchParams.get("year");
        const month = searchParams.get("month");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const response = await api.get("/dashboard/revenue-v2", {
            params: {
                Year: year || undefined,
                Month: month || undefined,
                StartDate: startDate || undefined,
                EndDate: endDate || undefined,
            },
        });

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching revenue:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
