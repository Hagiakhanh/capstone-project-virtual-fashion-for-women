import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { ticketId: string } }) {
   try {
      const { ticketId } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.put(`/ticketchat/${ticketId}/close`);
      if (responseBE.status === 200) {
         return NextResponse.json(
            {
               message: 'Đóng ticket chat thành công',
            },
            { status: 200 });
      }


   } catch (error) {
      return NextResponse.json({ message: 'Lỗi khi đóng ticket chat.' }, { status: 500 });
   }
}