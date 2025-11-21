import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ staffId: string }> }) {
   try {
      const { staffId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.put(`/auth/staff/${parseInt(staffId)}`);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Cập nhật thành công." }, { status: 200 });
      }
   } catch (error) {
      console.error("Server register error", error);
      return NextResponse.json({
         message: "Cập nhật thất bại.",
      }, { status: 500 });
   }
}