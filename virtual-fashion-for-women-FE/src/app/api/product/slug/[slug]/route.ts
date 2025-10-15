import { createApiInstance } from "@/api/instance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
   try {
      const api = createApiInstance(request);
      const { slug } = await params;
      const responseBE = await api.get(`/product/slug/${slug}`);
      if (responseBE.status == 200) {
         return NextResponse.json(responseBE.data);
      }
      return NextResponse.json({ message: 'Lấy thông tin chi tiết sản phẩm thất bại' }, { status: 404 });
   } catch (error: any) {
      return NextResponse.json(
         { message: 'Lấy thông tin chi tiết sản phẩm thất bại' },
         { status: 500 }
      );
   }
}