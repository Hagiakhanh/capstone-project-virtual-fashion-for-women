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
      `/salecampaign/${parseInt(salecampaignId)}/detail`
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
