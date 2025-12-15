import { OrderDetailDTO, OrderDetailStaffResponseDTO } from "./OrderDetailDTO";
import { StatusLogDTO } from "./StatusLogDTO";
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
    deliveringType: string;
    estimatedDelivery: string | null;
    paymentUrl: string;
    transactionInformations: TransactionInformation[];
    userInformation: UserInformation;
    responseOrderDetails: OrderDetailDTO[];
    responseStatusLogs: StatusLogDTO[];
}

export interface OrderStaffResponseDTO {
    orderId: number;
    createdAt: string;
    status: string;
    customerName: string;
    customerPhone: string | null;
    customerEmail: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    paymentMethod: string;
    paymentDate: string | null;
    paymentStatus: 'Pending' | 'Success' | 'Failed';
    insuranceFee: number;
    totalWithShippingMoney: number;
    shippingMoney: number;
    shippingCode: string | null;
    estimatedDelivery: string | null;
    amount: number; // TỔNG TIỀN HÀNG (Subtotal)
    totalQuantity: number;
    orderDetails: OrderDetailStaffResponseDTO[];
    responseStatusLogs: StatusLogDTO[];
    deliveringType: string | null;
}