import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const api = createApiInstance(request);
    const responseBE = await api.get(
      `/productinsalecampaign/campaign/${parseInt(campaignId)}`
    );
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching product in sale campaign by id",
      },
      { status: 400 }
    );
  }
}
