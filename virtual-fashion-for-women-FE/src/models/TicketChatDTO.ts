export interface TicketMessageResponseDTO {
   title: string;
   ticketChatId: number;
   ticketChatSlug: string;
   messages: TicketMessageDetailDTO[];
   ticketStatus: string;
}

export interface TicketMessageDetailDTO {
   messageId: number;
   senderId: number;
   content: string;
   createdAt: string;
   ownerRole: string;
}

export interface StaffTicketDashboardDTO {
   pendingTicket: number;
   openTicket: number;
   myAssignedTicket: number;
   ticketInformation: StaffTicketInformationDTO[];
}

export interface StaffTicketInformationDTO {
   customerName: string;
   ticketChatId: number;
   createAt: string;
   title: string;
   status: string;
   staffName: null | string;
   closedAt: null | string;
   ticketChatSlug: string;
}

export interface ItemTicketChatInformationDTO {
   ticketChatId: number;
   ticketChatSlug: string;
   title: string;
   createdAt: string;
   status: string;
   lastMessage: string;
   closedAt?: string | null;
}
