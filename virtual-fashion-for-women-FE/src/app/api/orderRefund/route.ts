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

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const PageIndex = searchParams.get("PageIndex");
      const PageSize = searchParams.get("PageSize");
      const refundStatus = searchParams.get("refundStatus");

      const api = createApiInstance(request);
      const responseBE = await api.get("/orderrefund", {
         params: {
            PageIndex: PageIndex,
            PageSize: PageSize,
            refundStatus: refundStatus,
         }
      })
      if (responseBE.status === 200) {
         const paginationHeader = responseBE?.headers?.get('X-Pagination');
         if (paginationHeader) {
            const paginationMetadata = JSON.parse(paginationHeader);
            return NextResponse.json({
               data: responseBE.data?.data,
               pagination: paginationMetadata
            }, { status: 200 });
         }
         return NextResponse.json({
            data: responseBE.data?.data
         }, { status: 200 });
      }


   } catch (error) {
      return NextResponse.json({ message: "Lỗi không thể lấy danh sách đơn hàng hoàn trả" }, { status: 500 });
   }
}