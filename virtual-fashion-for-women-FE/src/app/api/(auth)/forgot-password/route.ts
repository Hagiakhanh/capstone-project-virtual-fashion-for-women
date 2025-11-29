import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/auth/forgot-password', payload);
      if (responseBE?.status === 200) {
         return NextResponse.json({
            message: "Yêu cầu quên mật khẩu thành công.",
         }, { status: 200 });
      }

   } catch (error) {
      console.error("Server forgot password error", error);
      return NextResponse.json({
         message: "Yêu cầu quên mật khẩu thất bại.",
      }, { status: 500 });
   }
}