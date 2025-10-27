import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get("/skintone");
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("Lấy các loại tông da thất bại", error);
    return NextResponse.json(
      { message: "Lỗi lấy các loại tông da thất bại" },
      { status: 400 }
    );
  }
}
