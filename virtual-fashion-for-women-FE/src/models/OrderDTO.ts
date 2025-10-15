import { OrderDetailDTO } from "./OrderDetailDTO";
import { TransactionInformation } from "./TransactionInformation";
import { UserInformation } from "./UserInformation";

export interface OrderDTO {
    orderId: number;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    createdAt: string;
    status: string;
    amount: number | null;
    note: string;
    shippingMoney: number | null;
    insuranceFee: number | null;
    shippingCode: string;
    estimatedDelivery: string | null;
    paymentUrl: string;
    transactionInformation: TransactionInformation;
    userInformation: UserInformation;
    responseOrderDetails: OrderDetailDTO[];
}