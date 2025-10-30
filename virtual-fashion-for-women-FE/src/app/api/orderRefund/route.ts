import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const formData = await request.formData();
      const api = createApiInstance(request);
      const responseBE = await api.post("/orderrefund", formData, {
         headers: {
            "Content-Type": "multipart/form-data",
         },
      });
      if (responseBE.status === 200) {
         return NextResponse.json(
            { message: "Yêu cầu hoàn hàng đã được gửi thành công" },
            { status: 200 }
         );
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi không thể xử lý yêu cầu hoàn hàng" }, { status: 500 });
   }
}