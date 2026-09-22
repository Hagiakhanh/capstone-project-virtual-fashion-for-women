import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { orderRefundId: string } }) {
   try {
      const api = createApiInstance(request);
      const { orderRefundId } = await params;
      const responseBE = await api.put(`/orderrefund/staff/sync-ghn-status/${orderRefundId}`);
      if (responseBE.status == 200) {
         return NextResponse.json(
            {
               message: 'Đồng bộ trạng thái GHN thành công',
               data: responseBE.data?.data
            },
            { status: 200 }
         );
      }

   } catch (error) {
      return NextResponse.json(
         { message: 'Đồng bộ trạng thái GHN thất bại' },
         { status: 500 }
      );
   }
}