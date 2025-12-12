import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const isDescending = searchParams.get("isDescending");
        const status = searchParams.get("status");
        const api = createApiInstance(request);
        const responseBE = await api.get(`/transaction/get-pending-withdraw-transaction?PageIndex=${pageNumber}&PageSize=${pageSize}&isDescending=${isDescending}&status=${status}`);
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
        return NextResponse.json(
            error.response.data.message,
            { status: 400 }
        );
    }
}