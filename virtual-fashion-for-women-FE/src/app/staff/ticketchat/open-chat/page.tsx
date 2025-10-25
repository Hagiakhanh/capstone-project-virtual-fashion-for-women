'use client';

import { useEffect, useState } from 'react';
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO';
import { api } from '@/api/instance';
import StaffTicketChatList from '@/components/TicketChat/StaffTicketChatList';
import StaffTicketChatDetail from '@/components/TicketChat/StaffTicketChatDetail';

function StaffOpenChat() {
   const [selectedChatSlug, setSelectedChatSlug] = useState<string | null>(null);
   const [ticketData, setTicketData] = useState<ItemTicketChatInformationDTO[]>([]);

   const fetchTicketsChat = async () => {
      try {
         const response = await api.get('/ticketchat/staff/open-tickets');
         if (response.status === 200) {
            setTicketData(response.data?.data || []);
         } else {
            setTicketData([]);
         }

      } catch (error) {
         console.error('Lỗi khi lấy danh sách ticket chat:', error)
      }
   }

   useEffect(() => {
      fetchTicketsChat();
   }, [selectedChatSlug]);

   return (
      <>
         <div className='p-6'>
            {!selectedChatSlug ? (
               <StaffTicketChatList tickets={ticketData} onSelect={setSelectedChatSlug} />
            ) : (
               <StaffTicketChatDetail onBack={setSelectedChatSlug} ticketSlug={selectedChatSlug} />
            )}
         </div>
      </>
   );
}

export default StaffOpenChat;