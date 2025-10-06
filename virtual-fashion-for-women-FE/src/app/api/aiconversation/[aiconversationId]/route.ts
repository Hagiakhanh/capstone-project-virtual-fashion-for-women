import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ aiconversationId: string }> }
) {
  try {
    const { aiconversationId } = await params;
    const api = createApiInstance(request);
    const responseBE = await api.get(
      `/aiconversation/${parseInt(aiconversationId)}`
    );
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching ai conversation",
      },
      { status: 400 }
    );
  }
}
