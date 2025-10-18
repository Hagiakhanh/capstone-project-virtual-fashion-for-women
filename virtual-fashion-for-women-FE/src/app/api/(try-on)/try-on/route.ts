import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const reqBody = await request.formData();
        console.log("Request Body:", reqBody);
        const api = createApiInstance(request);
        const responseBE = await api.post(`/try-on-slot/create-try-on-slot`, reqBody);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
        return NextResponse.json("Tạo không thành công", { status: 400 });
    } catch (error: any) {
        return NextResponse.json({
            message: "Tạo không thành công: " + error.response?.data?.message,
        }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const reqBody = await request.json();

        const api = createApiInstance(request);
        const responseBE = await api.put(`/try-on-slot/update-output-image`, reqBody);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
        return NextResponse.json("Cập nhật không thành công", { status: 400 });
    }
    catch (error: any) {
        return NextResponse.json({
            message: "Cập nhật không thành công: " + error.response.data.message,
        }, { status: 400 });
    }
}