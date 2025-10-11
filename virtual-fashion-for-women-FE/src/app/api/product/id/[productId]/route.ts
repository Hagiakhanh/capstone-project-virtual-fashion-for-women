import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ productId: string }> } 
) {
    try {
        const { productId } = await context.params;
        const api = createApiInstance(request);
        const response = await api.get(`/product/id/${productId}`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'Failed to fetch product' },
            { status: error.response?.status || 500 }
        );
    }
}