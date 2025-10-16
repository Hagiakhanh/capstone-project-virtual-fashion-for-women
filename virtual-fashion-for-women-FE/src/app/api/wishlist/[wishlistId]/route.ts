import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { wishlistId: string } }) {
   try {
      const api = createApiInstance(request);
      const { wishlistId } = await params;
      const responseBE = await api.get(`/wishlist/${wishlistId}`);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Xóa khỏi yêu thích thành công." }, { status: 200 });
      }
      return NextResponse.json({
         message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."
      }, { status: responseBE.data?.status || 400 });

   } catch (error) {
      return NextResponse.json({ message: "Xóa khỏi yêu thích thất bại." }, { status: 500 });
   }
}