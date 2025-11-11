import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ salecampaignId: string }> }
) {
  try {
    const { salecampaignId } = await params;
    const { searchParams } = new URL(request.url);
    const api = createApiInstance(request);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const responseBE = await api.get(
      `/salecampaign/${parseInt(
        salecampaignId
      )}/statistic?startDate=${startDate}&endDate=${endDate}`
    );
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching statistic sale campaign by id",
      },
      { status: 400 }
    );
  }
}
