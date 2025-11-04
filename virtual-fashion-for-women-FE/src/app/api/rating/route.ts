import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post("/rating", body);

        if (responseBE.status === 201) {
            const dataResponse = responseBE.data?.data || {};
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }

        return NextResponse.json("Lỗi tạo đánh giá thất bại", { status: 500 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Lỗi tạo đánh giá thất bại: " + (error.response?.data?.message || error.message) },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request); // sử dụng axios instance đã cấu hình SSL + token
        const response = await api.get("/rating");

        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching rating:", error.message);
        return NextResponse.json(
            { message: `Lỗi: ${error.message}` },
            { status: error.response?.status || 500 }
        );
    }
}
