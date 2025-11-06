import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ orderRefundId: string }> }) {
   try {
      const { orderRefundId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.get(`/orderrefund/staff/${parseInt(orderRefundId)}`)
      if (responseBE.status === 200) {
         return NextResponse.json({
            data: responseBE.data?.data,
         },
            { status: responseBE.data?.statusCode });
      }

   } catch (error: any) {
      return NextResponse.json({
         message: "Lỗi lấy thông tin hoàn trả: " + error.response.data.message,
      }, { status: 400 });
   }
}
