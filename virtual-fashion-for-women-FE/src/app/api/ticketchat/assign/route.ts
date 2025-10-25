import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('ticketchat/assign', payload);
      if (responseBE.status === 200) {
         return NextResponse.json(
            {
               message: 'Nhận ticket chat thành công',
               data: responseBE.data?.data
            },
            { status: 200 }
         );
      }

   } catch (error) {
      return NextResponse.json({ message: 'Nhận ticket chat thất bại' }, { status: 500 });
   }
}