import { OrderDetailDTO } from "./OrderDetailDTO";
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
    insuranceFree: number | null;
    shippingCode: string;
    estimatedDelivery: string | null;
    userInformation: UserInformation;
    responseOrderDetails: OrderDetailDTO[];
}