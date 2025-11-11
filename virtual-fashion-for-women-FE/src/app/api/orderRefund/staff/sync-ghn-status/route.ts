import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
   try {
      const api = createApiInstance(request);
      const responseBE = await api.put(`/orderrefund/staff/sync-ghn-status`);
      if (responseBE.status == 200) {
         return NextResponse.json(
            { message: 'Đồng bộ trạng thái GHN thành công', },
            { status: 200 }
         );
      }

   } catch (error) {
      return NextResponse.json(
         { message: 'Đồng bộ trạng thái GHN thất bại' },
         { status: 500 }
      );
   }
}