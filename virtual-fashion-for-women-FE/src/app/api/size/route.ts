import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const response = await api.get("/size");
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching size:", error.message);
    return NextResponse.json(
      { message: `Lỗi: ${error.message}` },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const api = createApiInstance(request);
        const responseBE = await api.post("/size", body);

        if (responseBE.status === 201) {
            const dataResponse = responseBE.data?.data || [];
            return NextResponse.json(dataResponse, { status: responseBE.data?.statusCode });
        }

        return NextResponse.json("Lỗi tạo kích thước thất bại", { status: 500 });
    } catch (error: any) {
        return NextResponse.json({ message: "Lỗi tạo kích thước thất bại: " + error.response.data.message }, { status: 500 });
    }
}
