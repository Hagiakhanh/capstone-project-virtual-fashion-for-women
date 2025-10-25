import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const response = await api.get("/user");
        if (response.status === 200) {
            return NextResponse.json(response.data?.data, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message || "Lỗi khi lấy thông tin người dùng",
            {
                status: 400
            });
    }
}

