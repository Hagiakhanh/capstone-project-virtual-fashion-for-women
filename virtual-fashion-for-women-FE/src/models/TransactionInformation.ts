export interface TransactionInformation {
    transactionId: number;
    userId: number;
    orderId?: number;
    status: string;
    money: number;
    method: string;
    type: string;
    transactionCode: string;
    bankName?: string;
    bankAccountNumber?: string;
    createdAt: string;
    updatedAt: string;
}