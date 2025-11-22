import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get(`/salecampaign/active`);
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
