import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { orderRefundId: string } }) {
   try {
      const api = createApiInstance(request);
      const { orderRefundId } = await params;
      const responseBE = await api.put(`/orderrefund/staff/refund-money/${orderRefundId}`);
      if (responseBE.status == 200) {
         return NextResponse.json(
            {
               message: 'Hoàn tiền thành công',
            },
            { status: 200 }
         );
      }

   } catch (error) {
      return NextResponse.json(
         { message: 'Hoàn tiền thất bại' },
         { status: 500 }
      );
   }
}