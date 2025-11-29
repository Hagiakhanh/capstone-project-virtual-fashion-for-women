import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get("address");

        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const api = createApiInstance(request);
        const responseBE = await api.get(
            `/googlemap/autocomplete-location?address=${encodeURIComponent(address)}`
        );

        if (responseBE.status === 200) {
            const cities = responseBE.data?.data;
            return NextResponse.json(cities, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
        return NextResponse.json("Error fetching cities", { status: 500 });
    }
}