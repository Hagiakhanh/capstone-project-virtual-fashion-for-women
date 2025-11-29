import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/auth/create-new-password', payload);
      if (responseBE?.status === 200) {
         return NextResponse.json({
            message: "Tạo mật khẩu mới thành công.",
         }, { status: 200 });
      }

   } catch (error) {
      console.error("Server create new password error", error);
      return NextResponse.json({
         message: "Yêu cầu tạo mật khẩu mới thất bại.",
      }, { status: 500 });
   }
}