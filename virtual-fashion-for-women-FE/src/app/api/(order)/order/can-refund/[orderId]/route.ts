import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
   try {
      const { orderId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.get(`/order/${orderId}/can-refund`);
      if (responseBE.status === 200) {
         return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Không thể lấy thông tin" }, { status: 500 });
   }
}