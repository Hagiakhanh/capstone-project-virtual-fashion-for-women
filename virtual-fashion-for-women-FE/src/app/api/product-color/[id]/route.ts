import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const api = createApiInstance(request);
        const responseBE = await api.get(`/product/by-product-color/${id}`);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data;
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }

        return NextResponse.json(
            { message: "Lấy màu sản phẩm thất bại" },
            { status: responseBE.data?.statusCode }
        );

    } catch (error: any) {
        return NextResponse.json({
            message: "Lấy màu sản phẩm thất bại: " + error.response.data.message,
        }, { status: 400 });
    }
}