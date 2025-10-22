import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
   try {
      const api = createApiInstance(request);
      const { orderId } = await params;
      const responseBE = await api.get(`/order/staff/${orderId}`);
      if (responseBE.status == 200) {
         return NextResponse.json(responseBE.data?.data);
      }
      return NextResponse.json({ message: 'Lấy thông tin chi tiết sản phẩm thất bại' }, { status: 404 });
   } catch (error) {
      return NextResponse.json(
         { message: 'Lấy thông tin chi tiết đơn hàng thất bại' },
         { status: 500 }
      );
   }
}

export async function PUT(request: Request, { params }: { params: { orderId: string } }) {
   try {
      const api = createApiInstance(request);
      const { orderId } = await params;
      const responseBE = await api.put(`/order/staff/${orderId}`);
      if (responseBE.status == 200) {
         return NextResponse.json(
            { message: 'Cập nhật trạng thái đơn hàng thành công' },
            { status: 200 }
         );
      }
      return NextResponse.json({ message: 'Cập nhật trạng thái đơn hàng thất bại' }, { status: 404 });

   } catch (error) {
      return NextResponse.json(
         { message: 'Cập nhật trạng thái đơn hàng thất bại' },
         { status: 500 }
      );
   }
}