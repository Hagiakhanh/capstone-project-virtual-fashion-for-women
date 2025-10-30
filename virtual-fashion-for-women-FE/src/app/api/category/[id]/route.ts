import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";
import { error } from "console";

// GET /api/category/:id
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const api = createApiInstance(request);
        const responseBE = await api.get(`/category/${parseInt(id)}`);

        return NextResponse.json(responseBE.data, {
            status: responseBE.status,
        });
    } catch (error: any) {
        console.error("Error fetching category:", error?.message || error);

        return NextResponse.json(
        {
            message: "Không thể lấy thông tin category",
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
        const responseBE = await api.put(`/category/${parseInt(id)}`, body);

        if (responseBE.status == 200) {
            return NextResponse.json(responseBE.data?.data);
        }
        return NextResponse.json({ message: 'Cập nhật category thất bại' }, { status: responseBE.status });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Cập nhật category thất bại' },
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
        const responseBE = await api.delete(`/category/${parseInt(id)}`);

        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, {
                status: responseBE.data?.statusCode || 200,
            });
        }

        return NextResponse.json(
            { message: "Xóa category không thành công" },
            { status: responseBE.status }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Xóa category không thành công' },
            { status: 500 }
        );
    }
}

