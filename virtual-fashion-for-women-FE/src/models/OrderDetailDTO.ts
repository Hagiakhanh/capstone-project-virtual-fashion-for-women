import { ProductVariantDTO } from "./ProductVariantDTO";

export interface OrderDetailDTO {
    orderDetailId: number;
    quantity: number;
    orderId: number;
    priceAtTime: number;
    responseProductVariantDto: ProductVariantDTO;
    isReviewed: boolean;
}

export interface OrderDetailStaffResponseDTO {
    orderDetailID: number;
    quantity: number;
    productName: string;
    imageUrl: string | undefined;
    size: string;
    colorName: string;
    price: number;
    amount: number; // Tổng tiền của dòng sản phẩm này (quantity * price)
}