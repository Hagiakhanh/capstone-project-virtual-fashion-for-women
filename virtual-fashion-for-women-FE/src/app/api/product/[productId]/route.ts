import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const api = createApiInstance(request);
    const formData = await request.formData();
    
    const response = await api.put(`/product/${params.productId}`, formData, {
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