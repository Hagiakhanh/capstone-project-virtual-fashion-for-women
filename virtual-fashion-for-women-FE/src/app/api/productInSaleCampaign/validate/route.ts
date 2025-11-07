import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const api = createApiInstance(request);
    const responseBE = await api.post(
      "/productInSaleCampaign/validate",
      payload
    );

    if (responseBE.status === 200) {
      const dataResponse = responseBE.data;
      return NextResponse.json({...dataResponse}, {
        status: dataResponse.statusCode,
      });
    }
    return NextResponse.json("Lỗi kiểm tra các sản phẩm thất bại", {
      status: 400,
    });
  } catch (error: any) {
    return NextResponse.json(error.response.data.message, { status: 400 });
  }
}
