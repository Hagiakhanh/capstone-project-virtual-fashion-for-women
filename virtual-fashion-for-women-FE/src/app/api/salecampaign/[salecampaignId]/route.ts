import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ salecampaignId: string }> }
) {
  try {
    const { salecampaignId } = await params;
    const api = createApiInstance(request);
    const responseBE = await api.get(
      `/salecampaign/${parseInt(salecampaignId)}`
    );
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching sale campaign by id",
      },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ salecampaignId: string }> }
) {
  try {
    const { salecampaignId } = await params;
    const formData = await request.formData(); // Lấy FormData từ client
    const api = createApiInstance(request);

    // Gọi backend PUT đúng route
    const responseBE = await api.put(`/salecampaign/${parseInt(salecampaignId)}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(responseBE.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra",
        details: error.response?.data,
      },
      { status: error.response?.status || 400 }
    );
  }
}