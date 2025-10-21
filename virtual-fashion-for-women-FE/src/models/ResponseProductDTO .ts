import { TagDto } from "./RequestUpdateProduct";
import { ResponseProductColorDTO } from "./ResponseProductColorDto ";

export interface ResponseProductDTO {
    productId: string;
    productName: string;
    productSlug: string;
    price?: number;
    priceAtTime?: number;
    isInWishlist?: boolean;
    description: string;
    mainImageUrl: string;
    createdAt: string; // hoặc Date nếu bạn parse sang Date object
    categoryId: number;
    productColors: ResponseProductColorDTO[];
    tags: TagDto[];
}