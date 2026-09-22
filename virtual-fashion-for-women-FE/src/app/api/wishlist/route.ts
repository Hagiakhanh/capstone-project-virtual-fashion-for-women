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

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);

      const pageNumber = searchParams.get("pageNumber");
      const pageSize = searchParams.get("pageSize");

      const api = createApiInstance(request);

      // gọi API BE
      const responseBE = await api.get(
         `wishlist?PageIndex=${pageNumber}&PageSize=${pageSize}`
      );

      if (responseBE.status === 200) {
         const dataResponse = responseBE.data?.data || [];
         const paginationHeader = responseBE.headers["x-pagination"];
         const pagination = paginationHeader ? JSON.parse(paginationHeader) : null;

         return NextResponse.json(
               {
                  data: dataResponse,
                  pagination,
               },
               { status: responseBE.data?.statusCode }
         );
      }
   } catch (error: any) {
      return NextResponse.json(
         {
            message: error?.response?.data?.message || "Lỗi không xác định",
         },
         { status: 400 }
      );
   }
}