import { ProductVariantDTO } from "./ProductVariantDTO";

export interface CartItemDTO {
    selected: boolean;
    cartId: number;
    userId: number;
    createDate: string;
    quantityItem: number;
    productVariantId: string;
    responseProductVariantDto: ProductVariantDTO;
}
