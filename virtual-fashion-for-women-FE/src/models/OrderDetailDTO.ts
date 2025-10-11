import { ProductVariantDTO } from "./ProductVariantDTO";

export interface OrderDetailDTO {
    orderDetailId: number;
    quantity: number;
    orderId: number;
    priceAtTime: number;
    responseProductVariantDto: ProductVariantDTO;
}