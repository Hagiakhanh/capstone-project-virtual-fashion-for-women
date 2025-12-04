import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
   try {
      const { categoryId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.get(`/categorysizetemplate/by-categoryid-notfullmodel/${parseInt(categoryId)}`);
      if (responseBE.status === 200) {
         return NextResponse.json(responseBE.data, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi không lấy được danh sách mẫu size." }, { status: 500 });
   }
}