import { CartItemDTO } from "./CartItemDTO";
import { ResponseDeliveryTypeFee } from "./ResponseDeliveryTypeFee";

export interface CheckoutDTO {
    items: CartItemDTO[];
    totalWeight: number;
    totalProductPrice: number;
    deliveryTypeFees: ResponseDeliveryTypeFee[];
}
