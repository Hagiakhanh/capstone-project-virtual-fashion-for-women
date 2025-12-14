export interface ResponseDeliveryTypeFee {
    deliveryType: string;
    serviceFee: number;
    insuranceFee: number;
    totalPrice: number;
    error?: string;
}