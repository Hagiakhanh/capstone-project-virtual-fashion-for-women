import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
   try {
      const api = createApiInstance(request);
      const { productId } = await params;
      const responseBE = await api.delete(`/wishlist/product/${productId}`);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Xóa khỏi yêu thích thành công." }, { status: 200 });
      }
      return NextResponse.json({
         message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."
      }, { status: responseBE.data?.status || 400 });

   } catch (error) {
      return NextResponse.json({ message: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích." }, { status: 500 });
   }
}