import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const api = createApiInstance(request);
    const { searchParams } = new URL(request.url);
    const PageIndex = searchParams.get("pageIndex") || 1;
    const PageSize = searchParams.get("pageSize") || 1;
    const responseBE = await api.get(
      `/productinsalecampaign/campaign/${parseInt(campaignId)}`,
      {
        params: {
          PageIndex: PageIndex,
          PageSize: PageSize,
        },
      }
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
