import { CartItemDTO } from "./CartItemDTO";

export interface CheckoutDTO {
    items: CartItemDTO[];
    totalProductPrice: number;
    serviceFee: number;
    insuranceFee: number;
    totalPrice: number;
}
