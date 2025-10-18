import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { taskId: string } }) {
    try {
        const { taskId } = params;
        const api = createApiInstance(request);
        const responseBE = await api.get(`/fit-room/get-task-status/${taskId}`);
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data, { status: 200 });
        }
        return NextResponse.json("Không tìm thấy thông tin", { status: 404 });
    } catch (error: any) {
        return NextResponse.json({
            message: "Check status id thất bại: " + error.response.data.message,
        }, { status: 400 });
    }
}