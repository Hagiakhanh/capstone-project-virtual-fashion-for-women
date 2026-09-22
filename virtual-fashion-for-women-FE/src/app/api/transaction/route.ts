import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const pageNumber = searchParams.get("pageNumber") ?? 1;
        const pageSize = searchParams.get("pageSize") ?? 10;

        const orderId = searchParams.get("orderId") ?? "";
        const type = searchParams.get("type") ?? "";
        const status = searchParams.get("status") ?? "";
        const method = searchParams.get("method") ?? "";

        const startDate = searchParams.get("startDate") ?? "";
        const endDate = searchParams.get("endDate") ?? "";

        const api = createApiInstance(request);

        const responseBE = await api.get(
            `/transaction?orderId=${orderId}` +
            `&type=${type}` +
            `&status=${status}` +
            `&method=${method}` +
            `&startDate=${startDate}` +
            `&endDate=${endDate}` +
            `&PageIndex=${pageNumber}` +
            `&PageSize=${pageSize}`
        );

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
            {
                message: error?.response?.data?.message ?? "Đã xảy ra lỗi",
            },
            { status: 400 }
        );
    }
}
