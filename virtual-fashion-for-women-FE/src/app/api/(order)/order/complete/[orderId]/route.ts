import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
   try {
      const { orderId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.put(`/order/complete/${orderId}`);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Đơn hàng đã được hoàn tất." }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi khi hoàn tất đơn hàng." }, { status: 500 });
   }
}