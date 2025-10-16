import { createApiInstance } from "@/api/instance";
import { CreateWishlistDTO } from "@/models/WishlistDTO";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   try {
      const payload: CreateWishlistDTO = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/wishlist', payload);
      if (responseBE.status === 200) {
         return NextResponse.json({ message: "Thêm vào yêu thích thành công." }, { status: 200 });
      }
      return NextResponse.json({
         message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu."
      }, { status: responseBE.data?.status || 400 });

   } catch (error) {
      return NextResponse.json({ message: "Thêm vào yêu thích thất bại." }, { status: 500 });
   }
}