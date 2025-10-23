import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { ticketSlug: string } }) {
   try {
      const { ticketSlug } = await params;
      const api = createApiInstance(request);
      const responseBE = await api.get(`/ticketchat/${ticketSlug}/messages`);
      if (responseBE.status === 200) {
         return NextResponse.json(
            {
               message: 'Lấy tin nhắn thành công',
               data: responseBE.data?.data,
            },
            { status: 200 });
      }

   } catch (error) {
      return NextResponse.json({ message: 'Lấy tin nhắn thất bại' }, { status: 500 });
   }
}