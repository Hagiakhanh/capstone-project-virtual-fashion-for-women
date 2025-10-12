import { ColorDTO } from "./ColorDTO";
import { SizeDTO } from "./SizeDto";

export interface ProductVariantDTO {
    sizeId?: number;
    variantName: string;
    currentPrice: number;
    quantity: number;
    imageUrl: string;
    status: string;
    productWeight?: number;
    productLength?: number;
    productWidth?: number;
    productHeight?: number;
    sizeDto?: SizeDTO;
    colorDto?: ColorDTO
}
