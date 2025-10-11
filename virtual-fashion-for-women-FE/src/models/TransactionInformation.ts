export interface TransactionInformation {
    transactionId: number;
    userId: number;
    orderId: number;
    status: string;
    money: number;
    method: string;
    transactionCode: string;
    createAt: string;
    updatedAt: string;
}