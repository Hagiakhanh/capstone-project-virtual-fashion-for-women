import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

// GET /api/size/:id
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.get(`/size/${parseInt(id)}`);

        return NextResponse.json(responseBE.data, {
            status: responseBE.status,
        });
    } catch (error: any) {
        console.error("Error fetching size:", error?.message || error);

        return NextResponse.json(
        {
            message: "Không thể lấy thông tin size",
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
        const responseBE = await api.put(`/size/${parseInt(id)}`, body);

        if (responseBE.status == 200) {
            return NextResponse.json(responseBE.data?.data);
        }
        return NextResponse.json({ message: 'Cập nhật size thất bại' }, { status: responseBE.status });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Cập nhật size thất bại' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.delete(`/size/${parseInt(id)}`);

        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data, {
                status: responseBE.data?.statusCode || 200,
            });
        }

        return NextResponse.json(
            { message: "Xóa size không thành công" },
            { status: responseBE.status }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Xóa size không thành công' },
            { status: 500 }
        );
    }
}

