'use client';

import { api } from "@/api/instance";
import TicketChatCloseList from "@/components/TicketChat/TicketChatCloseList";
import TicketChatDetail from "@/components/TicketChat/TicketChatDetail";
import { ItemTicketChatInformationDTO } from "@/models/TicketChatDTO";
import { useEffect, useState } from "react";

function HistoryChatsPage() {
   const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
   const [ticketData, setTicketData] = useState<ItemTicketChatInformationDTO[]>([])

   const fetchTicketsChat = async () => {
      try {
         const response = await api.get('/ticketchat/customer/close-tickets')
         if (response.status === 200) {
            setTicketData(response.data?.data || [])
         } else {
            setTicketData([])
         }
      } catch (error) {
         console.error('Lỗi khi lấy danh sách ticket chat đóng:', error)
      }
   }

   useEffect(() => {
      fetchTicketsChat()
   }, [])

   return (
      <div className='p-6'>
         {!selectedTicket ? (
            <TicketChatCloseList tickets={ticketData} onSelect={setSelectedTicket} />
         ) : (
            <TicketChatDetail onBack={setSelectedTicket} ticketSlug={selectedTicket} />
         )}
      </div>
   )
}

export default HistoryChatsPage;