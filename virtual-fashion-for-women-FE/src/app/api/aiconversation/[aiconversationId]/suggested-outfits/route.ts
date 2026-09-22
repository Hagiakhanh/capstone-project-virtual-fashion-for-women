import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ aiconversationId: string }> }
) {
  try {
    const { aiconversationId } = await params;
    const api = createApiInstance(request);

    const { searchParams } = new URL(request.url);
    const pageSize = searchParams.get("pageSize") || "10";
    const pageCurrent = searchParams.get("pageCurrent") || "1";

    const responseBE = await api.get(
      `/aiconversation/${parseInt(aiconversationId)}/suggested-outfits`,
      {
        params: {
          pageSize: parseInt(pageSize),
          pageCurrent: parseInt(pageCurrent),
        },
      }
    );

    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching ai conversation suggestion list" },
      { status: 400 }
    );
  }
}
