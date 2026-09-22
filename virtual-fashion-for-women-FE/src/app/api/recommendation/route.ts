import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const topN = searchParams.get('topN') || '6';

        const api = createApiInstance(request);

        const responseBE = await api.get('/recommendation', {
            params: { topN: topN }
        });
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data, { status: 200 });
        } else {
            return NextResponse.json({ message: "Không lấy được gợi ý sản phẩm." }, { status: responseBE.status });
        }
    } catch (error) {
        console.error("Error when calling GetRecommendations:", error);
        return NextResponse.json({ message: "Lỗi không lấy được danh sách gợi ý sản phẩm." }, { status: 500 });
    }
}
