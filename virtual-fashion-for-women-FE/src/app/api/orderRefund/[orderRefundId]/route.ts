import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ orderRefundId: string }> }) {
   try {
      const { orderRefundId } = await params;
      const api = createApiInstance(req);
      const responseBE = await api.get(`/orderrefund/${orderRefundId}`);
      if (responseBE.status === 200) {
         return NextResponse.json(responseBE.data, { status: 200 });
      }

   } catch (error: any) {
      return NextResponse.json({ message: 'Lỗi khi lấy thông tin hoàn trả đơn hàng: ' + error.response?.data, }, { status: 500 });
   }
}