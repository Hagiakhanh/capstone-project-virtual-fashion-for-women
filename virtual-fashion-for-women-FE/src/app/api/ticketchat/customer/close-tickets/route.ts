import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   try {
      const api = createApiInstance(request);
      const responseBE = await api.get('/ticketchat/customer/close-tickets');
      if (responseBE.status === 200) {
         return NextResponse.json(
            {
               message: 'Lấy danh sách ticket chat đóng thành công',
               data: responseBE.data?.data,
            },
            { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Lấy danh sách ticket chat đóng thất bại' }, { status: 500 });
   }
}