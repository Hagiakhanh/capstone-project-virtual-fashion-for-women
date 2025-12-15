import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
   try {
      const { orderId } = await params;
      const { searchParams } = new URL(request.url);
      const statusText = searchParams.get("orderStatusEnum");

      const api = createApiInstance(request);
      const responseBE = await api.put(`/order/staff/external-delivering/${parseInt(orderId)}`, null, {
         params: {
            orderStatusEnum: statusText,
         }
      });
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Cập nhật trạng thái đơn hàng thành công." }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi khi cập nhật trạng thái đơn hàng." }, { status: 500 });
   }
}