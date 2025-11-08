import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        const api = createApiInstance(request);
        
        const responseBE = await api.post('/categorysizetemplate', payload);

        if (responseBE.status === 200 || responseBE.status === 201) {
            return NextResponse.json(responseBE.data, { status: responseBE.status });
        }

        return NextResponse.json(responseBE.data, { status: responseBE.status });

    } catch (error: any) {
        console.error("Server create category template error", error);
        if (error.response) {
            return NextResponse.json(error.response.data, { status: error.response.status });
        }
        return NextResponse.json({
            message: "Không thể tạo mẫu. Lỗi máy chủ.",
        }, { status: 500 });
    }
}