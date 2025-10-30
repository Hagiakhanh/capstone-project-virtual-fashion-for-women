import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const api = createApiInstance(request);
    const responseBE = await api.get("/characteristic");
    const dataResponse = responseBE.data;
    return NextResponse.json(dataResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("Lấy phong cách cá nhân thất bại", error);
    return NextResponse.json(
      { message: "Lỗi lấy phong cách cá nhân thất bại" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const api = createApiInstance(request);
    const body = await request.json(); // 👈 đổi ở đây
    const responseBE = await api.post("/characteristic", body, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(responseBE.data, { status: 200 });
  } catch (error) {
    console.error("Tạo phong cách cá nhân thất bại", error);
    return NextResponse.json(
      { message: "Lỗi tạo phong cách cá nhân thất bại" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const api = createApiInstance(request);
    const body = await request.json();
    const responseBE = await api.put("/characteristic", body, {
      headers: { "Content-Type": "application/json" },
    });

    return NextResponse.json(responseBE.data, { status: 200 });
  } catch (error) {
    console.error("Cập nhật phong cách cá nhân thất bại", error);
    return NextResponse.json(
      { message: "Lỗi cập nhật phong cách cá nhân thất bại" },
      { status: 400 }
    );
  }
}
