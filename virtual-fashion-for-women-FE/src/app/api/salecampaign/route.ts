import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);

    const { searchParams } = new URL(request.url);
    const pageSize = searchParams.get("pageSize") || "10";
    const pageIndex = searchParams.get("pageIndex") || "1";

    const responseBE = await api.get(`/salecampaign`, {
      params: {
        pageSize: parseInt(pageSize),
        pageIndex: parseInt(pageIndex),
      },
    });
    return responseBE;
  } catch (error: any) {
    console.error("Error fetching sale campaign:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}
