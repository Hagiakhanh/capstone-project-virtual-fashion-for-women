import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.get(`/rating/${parseInt(id)}`);

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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const api = createApiInstance(request);
        const responseBE = await api.put(`/rating/${parseInt(id)}`, body);

        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }

        return NextResponse.json(
            { message: "Cập nhật rating thất bại" },
            { status: responseBE.status }
        );
    } catch (error: any) {
        console.error("Error updating rating:", error?.message || error);

        return NextResponse.json(
            { message: "Cập nhật rating thất bại" },
            { status: 500 }
        );
    }
}
