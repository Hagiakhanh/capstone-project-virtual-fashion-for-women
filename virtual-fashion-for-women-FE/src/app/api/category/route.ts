import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request); // sử dụng axios instance đã cấu hình SSL + token
    const response = await api.get("/category");

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching category:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}

