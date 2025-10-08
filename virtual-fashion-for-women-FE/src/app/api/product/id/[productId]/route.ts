import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const api = createApiInstance(request);
    const response = await api.get(`/product/id/${params.productId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch product' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const api = createApiInstance(request);
    const response = await api.delete(`/product/${params.productId}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to delete product' },
      { status: error.response?.status || 500 }
    );
  }
}