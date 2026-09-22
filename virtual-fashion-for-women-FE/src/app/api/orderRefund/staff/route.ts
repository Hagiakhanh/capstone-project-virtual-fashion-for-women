import { createApiInstance } from "@/api/instance";
import { data } from "framer-motion/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url);
      const PageIndex = searchParams.get("PageIndex");
      const PageSize = searchParams.get("PageSize");
      const refundEnum = searchParams.get("refundEnum");
      const textSearch = searchParams.get("textSearch");

      const api = createApiInstance(req);
      const responseBE = await api.get("/orderrefund/staff", {
         params: {
            PageIndex: PageIndex,
            PageSize: PageSize,
            refundEnum: refundEnum,
            textSearch: textSearch
         },
      });

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

export async function PUT(req: Request) {
   try {
      const payload = await req.json();
      const api = createApiInstance(req);
      const responseBE = await api.put("/orderrefund/staff", payload);

      if (responseBE.status === 200) {
         return NextResponse.json({
            message: "Cập nhật trạng thái đơn hàng hoàn trả thành công",
            data: responseBE.data?.data
         }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi không thể cập nhật trạng thái đơn hàng hoàn trả" }, { status: 500 });
   }
}