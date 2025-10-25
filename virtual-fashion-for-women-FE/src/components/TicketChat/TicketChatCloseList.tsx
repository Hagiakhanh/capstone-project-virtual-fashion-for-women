'use client'

import { Card, List, Tag } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO';
import formatDate from '@/utils/formatDate';

function TicketChatCloseList({ tickets, onSelect }: { tickets: ItemTicketChatInformationDTO[], onSelect: (slug: string) => void }) {
   return (
      <div className='p-6'>
         <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Lịch sử hỗ trợ</h2>
         </div>

         <List
            dataSource={tickets}
            renderItem={(item) => (
               <Card
                  key={item?.ticketChatId}
                  className='!mb-3 hover:shadow cursor-pointer transition-all'
                  onClick={() => onSelect(item?.ticketChatSlug)}
               >
                  <div className='flex justify-between items-center'>
                     <div>
                        <div className='font-medium text-base flex items-center gap-2'>
                           <MessageOutlined /> <span className='text-lg'>{item?.title}</span>
                        </div>
                        <div className='text-gray-500 text-base'>{item?.lastMessage}</div>
                        <div className='text-xs text-gray-400'>
                           Tạo lúc: {formatDate(item?.createdAt)} - Đóng lúc: {item?.closedAt ? formatDate(item?.closedAt) : ''}
                        </div>
                     </div>
                     <div className='text-right'>
                        <Tag color='pink'>
                           {item?.status === 'Closed' ? 'Đã đóng' : ''}
                        </Tag>
                     </div>
                  </div>
               </Card>
            )}
         />

      </div>
   );
}

export default TicketChatCloseList;