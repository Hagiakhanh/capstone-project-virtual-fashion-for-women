import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const PageIndex = searchParams.get('PageIndex');
      const PageSize = searchParams.get('PageSize');
      const orderStatusEnum = searchParams.get('orderStatusEnum');
      const isDateDecrease = searchParams.get('isDateDecrease');
      const textSearch = searchParams.get('textSearch');

      const api = createApiInstance(request);
      const responseBE = await api.get('/order/staff', {
         params: {
            PageIndex: PageIndex,
            PageSize: PageSize,
            orderStatusEnum: orderStatusEnum,
            isDateDecrease: isDateDecrease,
            textSearch: textSearch,
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
         };
         return NextResponse.json({ data: responseBE.data?.data }, { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: "Lỗi khi lấy dữ liệu đơn hàng." }, { status: 500 });
   }
}