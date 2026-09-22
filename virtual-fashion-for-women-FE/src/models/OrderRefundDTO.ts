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
   customerReason: string;
   staffResponse: string | null;
   shippingCode: string | null;
   customerImage: string[];
   orderDeliveringType: string | null;
   orderRefundDeliveringType: string | null;
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

export interface OrderRefundStaffDTO {
   orderRefundId: number;
   createdAt: string;
   receiverName: string;
   receiverPhone: string;
   email: string;
   reason: string;
   amount: number;
   status: string;
}