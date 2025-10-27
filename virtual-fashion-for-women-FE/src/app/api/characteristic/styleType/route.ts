import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get("/styletype");
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("Lấy các phong cách thời trang thất bại", error);
    return NextResponse.json(
      { message: "Lỗi lấy các phong cách thời trang thất bại" },
      { status: 400 }
    );
  }
}
