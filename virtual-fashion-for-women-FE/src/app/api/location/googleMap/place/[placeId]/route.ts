import { createApiInstance } from "@/api/instance";

export async function POST(request: Request,
    { params }: { params: Promise<{ placeId: string }> }) {
    try {
        const { placeId } = await params;
        const api = createApiInstance(request);
        const response = await api.post(`/googlemap/place/${placeId}`);
        if (response.status == 200) {
            const data = await response.data?.data;
            return new Response(JSON.stringify(data), { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching place details:", error);
        return new Response("Error fetching place details", { status: 500 });
    }
}
