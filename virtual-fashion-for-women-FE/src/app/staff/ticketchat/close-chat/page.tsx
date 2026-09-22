'use client'

import { api } from '@/api/instance';
import StaffTicketChatDetail from '@/components/TicketChat/StaffTicketChatDetail';
import { StaffTicketDashboardDTO } from '@/models/TicketChatDTO';
import formatDate from '@/utils/formatDate';
import { List, Card, Tag, Button, Pagination } from 'antd';
import { useEffect, useState } from 'react';

function StaffCloseChat() {
   const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 5,
      totalCount: undefined,
   });
   const [ticketClose, setTicketClose] = useState<StaffTicketDashboardDTO>();
   const [selectedChatSlug, setSelectedChatSlug] = useState<string | null>(null);

   const fetchStaffTicketsChat = async () => {
      try {
         const response = await api.get('/ticketchat/staff', {
            params: {
               PageIndex: pagination.currentPage,
               PageSize: pagination.pageSize,
               isDateDecrease: true,
               ticketChatStatusEnum: 2 // Closed
            }
         })
         if (response.status === 200) {
            setTicketClose(response.data?.data);
            setPagination({
               ...pagination,
               totalCount: response.data?.pagination?.TotalCount,
               currentPage: response.data?.pagination?.CurrentPage,
            });
         }

      } catch (error) {
         console.error('Lỗi khi lấy danh sách ticket chat:', error)
      }
   }

   useEffect(() => {
      fetchStaffTicketsChat();
   }, [pagination.currentPage]);

   if (selectedChatSlug) {
      return (
         <StaffTicketChatDetail onBack={setSelectedChatSlug} ticketSlug={selectedChatSlug} />
      )
   }

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Lưu trữ hỗ trợ đã đóng</h1>
         </div>

         {/* Danh sách chat */}
         <Card
            title={<span className="text-xl font-semibold">Danh sách tin nhắn đã đóng</span>}
            className="rounded-xl shadow-sm"
         >
            <List
               itemLayout="horizontal"
               dataSource={ticketClose?.ticketInformation}
               renderItem={(item) => (
                  <Card
                     className='!mb-3 hover:shadow transition-all'
                     key={item.ticketChatId}
                  >
                     <div className='flex items-center justify-between'>
                        <div>
                           <p className="font-semibold text-base">{item.customerName}</p>
                           <p className="text-sm text-gray-500">
                              Ticket #{item.ticketChatId} • {item.title}
                           </p>
                           <p className="text-sm text-gray-500">
                              Mở lúc: {formatDate(item.createAt)} • Đóng lúc: {item.closedAt ? formatDate(item.closedAt) : 'N/A'}
                           </p>
                        </div>
                        <div className="ml-4">
                           {item.status.startsWith('Closed') ? (
                              <>
                                 <Tag color="gray">Đã giải quyết</Tag>
                                 <Button onClick={() => setSelectedChatSlug(item?.ticketChatSlug)} style={{ border: 'none' }} className='!bg-[#48BB78] !text-white'>Xem chi tiết</Button>
                              </>
                           ) : (
                              <></>
                           )}
                        </div>
                     </div>
                  </Card>
               )}
            />
            <div className="flex justify-end mt-4">
               <Pagination
                  current={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={pagination.totalCount}
                  onChange={(page) => setPagination({ ...pagination, currentPage: page })}
                  size="small"
               />
            </div>
         </Card>
      </div>
   )
}

export default StaffCloseChat;   