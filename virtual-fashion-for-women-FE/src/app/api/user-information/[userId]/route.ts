import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";
import { parse } from "path";

export async function PUT(request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        console.log("Updating user with ID:", userId);
        const api = createApiInstance(request);
        const body = await request.json();
        const response = await api.put(`/user/${parseInt(userId)}`, body);
        if (response.status === 200) {
            return NextResponse.json(response.data?.data, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message,
            {
                status: 400
            });
    }
}