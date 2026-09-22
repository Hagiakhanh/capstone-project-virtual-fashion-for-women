// types/dashboard.d.ts (hoặc đặt trong file của component)
export interface BasicSystemIndicator {
    totalProcessingOrders: number;
    totalRefundOrders: number;
    totalCompletedOrders: number;
    totalRefundsCompleted: number;

    totalCustomers: number;
    totalStaffs: number;

    totalGrossRevenue: number;
    totalRefundAmount: number;
    totalNetRevenue: number;
}

export interface TransactionAdmin {
    transactionId: number;
    userName: string;
    orderId: number;
    status: string;
    money: number;
    method: string;
    type: string;
    createdAt: string; // Hoặc Date nếu parse
    updatedAt: string; // Hoặc Date nếu parse
}