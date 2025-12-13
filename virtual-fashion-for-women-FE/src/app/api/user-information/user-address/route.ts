import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   try {
      const api = createApiInstance(request);
      const responseBE = await api.get("/user/user-address");
      if (responseBE.status === 200) {
         return NextResponse.json(responseBE.data?.data, { status: 200 });
      }

   } catch (error: any) {
      return NextResponse.json("Lỗi khi lấy địa chỉ người dùng", {
         status: 400
      });
   }
}