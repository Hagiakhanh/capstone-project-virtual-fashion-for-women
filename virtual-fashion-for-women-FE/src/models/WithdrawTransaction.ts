export interface WithdrawTransaction {
    transactionId: number;
    userName: string;
    bankName: string;
    bankAccountNumber: string;
    status: string;
    money: number | null;
    method: string;
    type: string;
    thirdPartyCode: string;
    createdAt: string;
}