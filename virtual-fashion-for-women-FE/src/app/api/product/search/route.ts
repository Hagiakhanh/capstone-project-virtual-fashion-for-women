import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function GET(request: NextRequest) {
    try {
        //const payload: typeRequestListProduct = await request.json();
        const { searchParams } = new URL(request.url);
        const PageIndex = searchParams.get('PageIndex');
        const PageSize = searchParams.get('PageSize');
        const ProductSort = searchParams.get('ProductSort');

        const api = createApiInstance(request);
        const responseBE = await api.get('/product/search', {
            params: {
                PageIndex: PageIndex,
                PageSize: PageSize,
                ProductSort: ProductSort
            }
        });
        if (responseBE.status === 200) {
            return NextResponse.json(responseBE.data?.data, { status: 200 });
        }
    } catch (error) {
        console.error("Error when calling list products:", error);
        return NextResponse.json({ message: "Lỗi không lấy được danh sách sản phẩm." }, { status: 500 });
    }
}
