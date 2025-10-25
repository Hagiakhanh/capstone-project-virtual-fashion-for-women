'use client';

import { Card, List, Tag } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO';

function StaffTicketChatList({ tickets, onSelect }: { tickets: ItemTicketChatInformationDTO[], onSelect: (slug: string) => void }) {

   return (
      <Card
         title={<span className="text-xl font-semibold">Danh sách đang hỗ trợ</span>}
         className="rounded-xl shadow-sm"
      >
         <List
            itemLayout="horizontal"
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
                     </div>
                     <div className='text-right'>
                        <Tag color='green'>
                           {item?.status === 'Open' ? 'Đang mở' : ''}
                        </Tag>
                     </div>
                  </div>
               </Card>
            )}
         />
      </Card>
   );
}

export default StaffTicketChatList;