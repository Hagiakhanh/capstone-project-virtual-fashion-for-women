import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get("/occasionpreference");
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("Lấy các mục đích mặc trang phục thất bại", error);
    return NextResponse.json(
      { message: "Lỗi lấy các mục đích mặc trang phục thất bại" },
      { status: 400 }
    );
  }
}
