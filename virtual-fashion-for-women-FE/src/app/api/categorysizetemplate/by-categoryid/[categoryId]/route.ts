import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

// GET /api/size/:id
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.get(`/categorysizetemplate/by-categoryid/${parseInt(categoryId)}`);

        return NextResponse.json(responseBE.data, {
            status: responseBE.status,
        });
    } catch (error: any) {
        console.error("Error fetching category size template:", error?.message || error);

        return NextResponse.json(
        {
            message: "Không thể lấy thông tin mẫu kích thước theo danh mục",
            details: error?.response?.data?.message || error?.message,
        },
        { status: error?.response?.status || 500 }
        );
    }
}