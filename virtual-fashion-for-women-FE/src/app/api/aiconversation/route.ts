import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const response = await api.get("/aiconversation");

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ai conversation:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const api = createApiInstance(request);
    const responseBE = await api.post("/aiconversation", {
      characteristicId: payload.characteristicId,
    });
    if (responseBE.status === 200) {
      const dataResponse = responseBE.data;
      return NextResponse.json(dataResponse, {
        status: responseBE.data?.statusCode,
      });
    }
    return NextResponse.json("Tạo cuộc trò chuyện AI thất bại", {
      status: 400,
    });
  } catch (error) {
    console.error("Tạo cuộc trò chuyện AI thất bại", error);
    return NextResponse.json(
      { message: "Lỗi tạo cuộc trò chuyện AI thất bại" },
      { status: 400 }
    );
  }
}
