import { NextRequest, NextResponse } from 'next/server';
import { createApiInstance } from '@/api/instance';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ transactionId: string }> }) {
    try {
        const { transactionId } = await params;
        const api = createApiInstance(request);
        const response = await api.post(`transaction/${transactionId}/accept-withdraw-transaction`);
        console.log('Đã vào api:');
        if (response.status === 200) {
            return NextResponse.json(response.data);
        }
    } catch (error: any) {
        return NextResponse.json(
            error.response.data.message,
            { status: 400 }
        );
    }
}