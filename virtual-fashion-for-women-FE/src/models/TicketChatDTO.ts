export interface TicketMessageResponseDTO {
   title: string;
   ticketChatId: number;
   ticketChatSlug: string;
   messages: TicketMessageDetailDTO[];
}

export interface TicketMessageDetailDTO {
   messageId: number;
   senderId: number;
   content: string;
   createdAt: string;
   ownerRole: string;
}