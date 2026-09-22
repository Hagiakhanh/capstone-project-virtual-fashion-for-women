import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const api = createApiInstance(request);
    const responseBE = await api.post("/message/aiconversation", {
      aiConversationID: payload.aiConversationID,
      message: payload.content,
    });
    if (responseBE.status === 200) {
      const dataResponse = responseBE.data;
      return NextResponse.json(dataResponse, {
        status: responseBE.data?.statusCode,
      });
    }
    return NextResponse.json("Gửi tin nhắn đến AI thất bại", {
      status: 400,
    });
  } catch (error) {
    console.error("Gửi tin nhắn đến AI thất bại", error);
    return NextResponse.json(
      { message: "Gửi tin nhắn đến AI thất bại" },
      { status: 400 }
    );
  }
}
