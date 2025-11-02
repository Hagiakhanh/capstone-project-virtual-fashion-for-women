export interface TransactionInformation {
    transactionId: number;
    userId: number;
    orderId?: number;
    status: string;
    money: number;
    method: string;
    type: string;
    transactionCode: string;
    createAt: string;
    updatedAt: string;
}