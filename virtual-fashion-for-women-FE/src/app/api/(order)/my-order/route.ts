import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get("pageNumber");
        const pageSize = searchParams.get("pageSize");
        const statusFilter = searchParams.get("statusFilter");
        const api = createApiInstance(request);
        const responseBE = await api.get(`/order/customer/all-orders?PageIndex=${pageNumber}&PageSize=${pageSize}&orderStatus=${statusFilter}`);
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
        return NextResponse.json("Lấy đơn hàng thất bại", { status: 400 });
    } catch (error) {
        return NextResponse.json({
            message: "Lấy đơn hàng thất bại: ", error,
        }, { status: 400 });
    }
}