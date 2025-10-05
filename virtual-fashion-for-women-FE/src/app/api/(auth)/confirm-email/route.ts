import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/auth/confirm-email', payload);
      if (responseBE.status === 200) {
         return NextResponse.json({
            message: "Xác nhận email thành công."
         }, { status: 200 });
      }
      return NextResponse.json({ message: "Xác nhận email thất bại." }, { status: 400 });

   } catch (error) {
      console.error("Server confirm email error", error);
      return NextResponse.json({
         message: "Xác nhận email thất bại.",
      }, { status: 400 });
   }
}