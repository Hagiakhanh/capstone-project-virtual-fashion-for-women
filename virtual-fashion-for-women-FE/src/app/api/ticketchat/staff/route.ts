import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const PageIndex = searchParams.get('PageIndex');
      const PageSize = searchParams.get('PageSize');
      const isDateDecrease = searchParams.get('isDateDecrease');

      const api = createApiInstance(request);
      const responseBE = await api.get('/ticketchat/staff', {
         params: {
            PageIndex: PageIndex,
            PageSize: PageSize,
            isDateDecrease: isDateDecrease
         }
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
         return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Lấy danh sách ticket chat thất bại' }, { status: 500 });
   }
}