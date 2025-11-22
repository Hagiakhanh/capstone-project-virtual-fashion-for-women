import { createApiInstance } from "@/api/instance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
   try {
      const api = createApiInstance(request);
      const { searchParams } = new URL(request.url);
      const PageIndex = searchParams.get("PageIndex");
      const PageSize = searchParams.get("PageSize");
      const isActive = searchParams.get("isActive");

      const responseBE = await api.get("/user/staffs", {
         params: { PageIndex, PageSize, isActive },
      });

      if (responseBE.status === 200) {
         const paginationHeader = responseBE?.headers?.get('X-Pagination');
         if (paginationHeader) {
            const paginationMetadata = JSON.parse(paginationHeader);
            return NextResponse.json({
               data: responseBE.data?.data,
               pagination: paginationMetadata
            }, { status: 200 });
         };
         return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
      }

   } catch (error) {
      console.error("Error fetching staffs", error);
      return NextResponse.json({
         message: "Lấy danh sách nhân viên thất bại.",
      }, { status: 500 });
   }
}