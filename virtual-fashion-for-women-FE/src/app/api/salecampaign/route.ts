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
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: dataResponse.data?.statusCode,
    });
  } catch (error: any) {
    console.error("Error fetching sale campaign:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const formData = await request.formData(); // Lấy FormData từ request
    const api = createApiInstance(request);
    const responseBE = await api.post("/saleCampaign", formData);

    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: responseBE.data?.statusCode,
    });
  } catch (error: any) {
   return NextResponse.json(
      {
        message:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
        details: error.response?.data,
      },
      { status: error.response?.status || 400 }
    );
  }
}
