import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const api = createApiInstance(request);
        const responseBE = await api.get(`notification?PageIndex=${pageNumber}&PageSize=${pageSize}`);
        if (responseBE.status === 200) {
            const dataResponse = responseBE.data?.data || [];
            const paginationHeader = responseBE.headers["x-pagination"];
            const pagination = paginationHeader ? JSON.parse(paginationHeader) : null;
            return NextResponse.json(
                {
                    data: dataResponse,
                    pagination,
                },
                { status: responseBE.data?.statusCode }
            );
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const api = createApiInstance(request);
        const responseBE = await api.put(`notification/mark-all-as-read`);
        if (responseBE.status === 200) {
            return NextResponse.json({}, { status: responseBE.data?.statusCode });
        }
    } catch (error: any) {
        return NextResponse.json({
            message: error.response.data.message,
        }, { status: 400 });
    }
}