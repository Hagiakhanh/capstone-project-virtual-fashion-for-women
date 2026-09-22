import { ResponseProductDTO } from "./ResponseProductDTO";

export interface ProductInSaleDTO {
    productId: string;
    percentDiscount: number;
    salePrice: number;
    product: ResponseProductDTO; 
    campaignId: number;
    campaignDetail: any;
}