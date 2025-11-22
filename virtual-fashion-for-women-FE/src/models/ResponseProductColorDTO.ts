import { ColorDTO } from "./ColorDTO";
import { ProductVariantDTO } from "./ProductVariantDTO";
import { ResponseProductImageDTO } from "./ResponseProductImageDTO";

export interface ResponseProductColorDTO {
    productColorId: string;
    colorId?: number;
    lensId: string;
    packageLens: string;
    noBgImgUrl: string;
    color: ColorDTO;
    productImagesDto: ResponseProductImageDTO[];
    productVariants: ProductVariantDTO[];
}