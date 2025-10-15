import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function DELETE(request: Request,
    { params }: { params: Promise<{ cartId: string }> }) {
    try {
        const { cartId } = await params;
        const api = createApiInstance(request);
        const responseBE = await api.delete(`/cart/remove-item/${parseInt(cartId)}`)
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.message;
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }

        return NextResponse.json(
            { message: "Xóa không thành công" },
            { status: responseBE.data?.statusCode }
        );
    }
    catch (error: any) {
        return NextResponse.json({
            message: "Lỗi cập nhật thất bại: " + error.response.data.message,
        }, { status: 400 });
    }
}