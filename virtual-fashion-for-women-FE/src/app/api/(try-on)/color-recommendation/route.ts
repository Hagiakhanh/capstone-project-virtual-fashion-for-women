import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        //const payload: typeRequestListProduct = await request.json();
        const { searchParams } = new URL(request.url);
        const PageIndex = searchParams.get('PageIndex');
        const PageSize = searchParams.get('PageSize');
        const CategoryName = searchParams.get('CategoryName');
        const Hexcode = searchParams.get('Hexcode');
        const encodedHex = encodeURIComponent(Hexcode || '');
        const api = createApiInstance(request);
        const responseBE = await api.get(`/product/recommended-color/${encodedHex}`, {
            params: {
                PageIndex: PageIndex,
                PageSize: PageSize,
                categoryName: CategoryName,
            }
        });
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data || [], { status: 200 });
        }
    } catch (error: any) {
        console.error("Error when calling list products:", error);
        return NextResponse.json(error.response?.data?.message, { status: 400 });
    }

}