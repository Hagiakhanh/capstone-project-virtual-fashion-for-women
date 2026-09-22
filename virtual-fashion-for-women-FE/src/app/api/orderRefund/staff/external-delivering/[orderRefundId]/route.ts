import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ orderRefundId: string }> }) {
   try {
      const { orderRefundId } = await params;
      const { searchParams } = new URL(request.url);
      const statusText = searchParams.get("orderRefundStatusEnum");

      const api = createApiInstance(request);
      const responseBE = await api.put(`/orderrefund/staff/external-delivering/${parseInt(orderRefundId)}`, null, {
         params: {
            orderRefundStatusEnum: statusText,
         }
      });
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Cập nhật trạng thái hoàn hàng thành công." }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi khi cập nhật trạng thái hoàn hàng." }, { status: 500 });
   }
}