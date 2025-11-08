import { NextRequest, NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const body = await request.json();

        const api = createApiInstance(request);
        const responseBE = await api.put(`/categorysizetemplate/${parseInt(categoryId)}`, body);

        if (responseBE.status == 200) {
            return NextResponse.json(responseBE.data);
        }
        return NextResponse.json({ message: 'Cập nhật category size template thất bại' }, { status: responseBE.status });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Cập nhật category size template thất bại' },
            { status: 500 }
        );
    }
}