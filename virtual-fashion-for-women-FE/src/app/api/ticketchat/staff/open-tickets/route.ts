import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   try {
      const api = createApiInstance(request);
      const responseBE = await api.get('/ticketchat/staff/open-tickets');
      if (responseBE.status === 200) {
         return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Lỗi khi lấy danh sách ticket chat' }, { status: 500 });
   }
}