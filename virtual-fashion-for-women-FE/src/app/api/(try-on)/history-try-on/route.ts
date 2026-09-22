import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const isDescesing = searchParams.get("isDescesing") === "true";
        const api = createApiInstance(request);
        const responseBE = await api.get(`/try-on-slot/history-try-on-slot?PageIndex=${pageNumber}&PageSize=${pageSize}`);
        if (responseBE.status === 200) {
            const paginationHeader = responseBE?.headers?.get('X-Pagination');
            if (paginationHeader) {
                const paginationMetadata = JSON.parse(paginationHeader);
                return NextResponse.json({
                    data: responseBE.data?.data,
                    pagination: paginationMetadata
                }, { status: 200 });
            };
            return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
        }
        return NextResponse.json("Lấy lịch sử không thành công", { status: 400 });
    }
    catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}