import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get("/characteristic");
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("Lấy phong cách cá nhân thất bại", error);
    return NextResponse.json(
      { message: "Lỗi lấy phong cách cá nhân thất bại" },
      { status: 400 }
    );
  }
}
