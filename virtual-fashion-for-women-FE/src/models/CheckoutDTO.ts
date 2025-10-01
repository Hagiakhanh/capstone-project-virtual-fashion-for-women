import { CartItemDTO } from "./CartItemDTO";

export interface CheckoutDTO {
    items: CartItemDTO[];
    totalProductPrice: number;
    serviceFree: number;
    insuranceFee: number;
    totalPrice: number;
}
