import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
    try {
        const { productId } = await params;
        const api = createApiInstance(request);
        const formData = await request.formData();

        const response = await api.put(`/product/${productId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        });
        
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'Failed to update product' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const { productId } = await params;
        const api = createApiInstance(request);
        const response = await api.delete(`/product/${productId}`);
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'Failed to delete product' },
            { status: error.response?.status || 500 }
        );
    }
}