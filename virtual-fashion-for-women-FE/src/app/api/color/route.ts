import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const response = await api.get("/color");
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching color:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}
