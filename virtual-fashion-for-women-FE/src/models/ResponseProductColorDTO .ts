import { ColorDTO } from "./ColorDTO";
import { ProductVariantDTO } from "./ProductVariantDTO";
import { ResponseProductImageDTO } from "./ResponseProductImageDTO ";

export interface ResponseProductColorDTO {
    productColorId: string;
    colorId?: number;
    lensId: string;
    noBgImgUrl: string;
    color: ColorDTO;
    productImagesDto: ResponseProductImageDTO[];
    productVariants: ProductVariantDTO[];
}