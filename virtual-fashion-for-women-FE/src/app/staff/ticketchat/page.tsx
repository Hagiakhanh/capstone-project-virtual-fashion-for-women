'use client'

import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import { StaffTicketDashboardDTO } from '@/models/TicketChatDTO';
import formatDate from '@/utils/formatDate';
import { List, Card, Tag, Button, Pagination } from 'antd';
import { span, tr } from 'framer-motion/client';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react';
function StaffTicketChatDashboard() {
   const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 5,
      totalCount: undefined,
   });
   const [ticketDashboard, setTicketDashboard] = useState<StaffTicketDashboardDTO>();

   const fetchStaffTicketsChat = async () => {
      try {
         const response = await api.get('/ticketchat/staff', {
            params: {
               PageIndex: pagination.currentPage,
               PageSize: pagination.pageSize,
               isDateDecrease: true
            }
         })
         if (response.status === 200) {
            setTicketDashboard(response.data?.data);
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

   const handleAssignTicket = async (ticketChatId: number) => {
      try {
         const payload = {
            ticketChatId: ticketChatId
         }
         const response = await api.post('/ticketchat/assign', payload);
         if (response.status === 200) {
            fetchStaffTicketsChat();
            messageToast.success('Nhận hỗ trợ thành công');
         }
      } catch (error) {
         console.error('Lỗi khi nhận ticket chat:', error)
         messageToast.error('Nhận hỗ trợ thất bại');
      }
   }

   useEffect(() => {
      fetchStaffTicketsChat();
   }, [pagination.currentPage]);

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Bảng điều khiển Nhân viên Hỗ trợ</h1>
         </div>

         {/* Thống kê */}
         <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md">
               <div>
                  <div className='flex flex-col items-center justify-center p-4'>
                     <h2 className="text-2xl font-bold mt-1">{ticketDashboard?.pendingTicket || 0}</h2>
                     <div className='flex gap-2 info-center mt-1'>
                        <Clock size={25} />
                        <p className="text-lg font-semibold">Yêu cầu chờ xử lý</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-md">
               <div>
                  <div className='flex flex-col items-center justify-center p-4'>
                     <h2 className="text-2xl font-bold mt-1">{ticketDashboard?.openTicket || 0}</h2>
                     <div className='flex gap-2 info-center mt-1'>
                        <MessageSquare size={25} />
                        <p className="text-lg font-semibold">Yêu cầu đang xử lý</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-md">
               <div>
                  <div className='flex flex-col items-center justify-center p-4'>
                     <h2 className="text-2xl font-bold mt-1">{ticketDashboard?.myAssignedTicket || 0}</h2>
                     <div className='flex gap-2 info-center mt-1'>
                        <CheckCircle size={25} />
                        <p className="text-lg font-semibold">Yêu cầu của bạn</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Danh sách chat */}
         <Card
            title={<span className="text-xl font-semibold">Hàng đợi Chat - Chưa được xử lý</span>}
            className="rounded-xl shadow-sm"
         >
            <List
               itemLayout="horizontal"
               dataSource={ticketDashboard?.ticketInformation}
               renderItem={(item) => (
                  <Card
                     className='!mb-3 hover:shadow transition-all'
                     key={item.ticketChatId}
                  >
                     <div className='flex items-center justify-between'>
                        <div>
                           <p className="font-semibold text-base">{item.customerName}</p>
                           <p className="text-sm text-gray-500">
                              Ticket #{item.ticketChatId} • {formatDate(item.createAt)} • {item.title}
                           </p>
                        </div>
                        <div className="ml-4">
                           {item.status.startsWith('Pending') ? (
                              <>
                                 <Tag color="pink">Mới</Tag>
                                 <Button onClick={() => handleAssignTicket(item.ticketChatId)} style={{ border: 'none' }} className='!bg-[#48BB78] !text-white'>Nhận yêu cầu</Button>
                              </>
                           ) : (
                              <Tag color="green">{item.status == 'Open' ? `Đã nhận - ${item.staffName}` : ''}</Tag>
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


export default StaffTicketChatDashboard;