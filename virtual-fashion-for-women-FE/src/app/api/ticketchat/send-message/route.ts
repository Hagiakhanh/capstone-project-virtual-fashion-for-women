import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/ticketchat/send-message', payload);
      if (responseBE.status === 200) {
         return NextResponse.json(
            {
               message: 'Gửi tin nhắn thành công',
               data: responseBE.data?.data,
            },
            { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Gửi tin nhắn thất bại' }, { status: 500 });
   }
}