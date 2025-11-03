export interface OrderRefundDTO {
   orderRefundId: number;
   status: string;
   amount: number;
   createdAt: string;
   address: string;
   itemRefunds: ItemRefundDTO[];
}

export interface ItemRefundDTO {
   productVarientName: string;
   productVarientImage: string;
}

export interface OrderRefundDetailDTO {
   orderRefundId: number;
   createdAt: string;
   orderRefundStatus: string;
   productCount: number;
   customerName: string;
   customerPhone: string | null;
   customerEmail: string | null;
   receiverName: string;
   receiverAddress: string;
   receiverPhone: string | null;
   amount: number;
   transactionStatus: string | null;
   transactionTime: string | null;
   items: ItemRefundDetailDTO[];
}

export interface ItemRefundDetailDTO {
   variantName: string;
   variantImage: string;
   variantColor: string;
   variantSize: string;
   variantPrice: number;
   quantity: number;
   variantAmount: number;
}