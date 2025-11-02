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