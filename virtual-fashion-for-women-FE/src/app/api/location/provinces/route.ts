import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const api = createApiInstance(request);
        const responseBE = await api.get('/shipping/get-province');
        if (responseBE.status === 200) {
            const cities = responseBE.data?.data;
            return NextResponse.json(cities, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json("Error fetching cities", { status: 500 });
    }
}   