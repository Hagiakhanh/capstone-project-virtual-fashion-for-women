import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const reqBody = await request.formData();
        const api = createApiInstance(request);
        const responseBE = await api.post(`/try-on-slot/check-image-model-gemini`, reqBody);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data, { status: 200 });
        }
        return NextResponse.json("Ảnh không hợp lệ", { status: 400 });
    } catch (error: any) {
        return NextResponse.json({
            message: "Ảnh không hợp lệ: " + error.response.data.message,
        }, { status: 400 });
    }
}
