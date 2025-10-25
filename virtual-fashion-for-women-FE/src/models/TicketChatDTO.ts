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
}