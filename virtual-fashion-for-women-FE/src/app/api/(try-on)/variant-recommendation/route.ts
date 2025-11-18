import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const reqBody = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post(`/productvariant/recommend-size`, reqBody);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
        return NextResponse.json("Gợi ý size không thành công", { status: 400 });
    } catch (error: any) {
        return NextResponse.json({
            message: "Gợi ý size không thành công: " + error.response?.data?.message,
        }, { status: 400 });
    }
}