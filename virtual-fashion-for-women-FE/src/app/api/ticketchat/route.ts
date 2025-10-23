import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/ticketchat', payload);
      if (responseBE.status === 201) {
         return NextResponse.json(
            {
               message: 'Tạo yêu cầu hỗ trợ mới thành công',
               data: responseBE.data?.data,
            },
            { status: 201 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Tạo yêu cầu hỗ trợ mới thất bại' }, { status: 500 });
   }
}