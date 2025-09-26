import { NextResponse } from "next/server";

import { createApiInstance } from "@/api/instance";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/auth/register', payload);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Đăng ký thành công." }, { status: 200 });
      }
      return NextResponse.json({ message: "Đăng ký thất bại." }, { status: 400 });

   } catch (error) {
      console.error("Server register error", error);
      return NextResponse.json({
         message: "Đăng ký thất bại.",
      }, { status: 400 });
   }
}