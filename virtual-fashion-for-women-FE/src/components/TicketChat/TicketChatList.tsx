'use client'

import { useState } from 'react'
import { Button, Card, List, Tag, Modal, Input, Form } from 'antd'
import { MessageOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '@/api/instance'
import { messageToast } from '@/helpers/toastHelper'
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO'
import formatDate from '@/utils/formatDate'

function TicketChatList({ tickets, onSelect, fetchTicketsChat }: { tickets: ItemTicketChatInformationDTO[], onSelect: (slug: string) => void, fetchTicketsChat: () => void }) {
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [form] = Form.useForm()

   const handleCreate = () => {
      form.resetFields()
      setIsModalOpen(true)
   }

   const handleSubmitNewChat = async () => {
      try {
         const values = await form.validateFields()
         const response = await api.post('/ticketchat', values)
         if (response.status === 201) {
            messageToast.success('Tạo yêu cầu hỗ trợ mới thành công.')
            fetchTicketsChat()
            setIsModalOpen(false)
         }

      } catch (error) {
         messageToast.error('Lỗi khi tạo yêu cầu hỗ trợ mới.')
         console.error('Lỗi khi tạo ticket chat:', error)
      }

   }

   return (
      <>
         {/* Phần header bên trên */}
         <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0'>
            <h2 className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-2 sm:mb-6'>
               Yêu cầu hỗ trợ
            </h2>
            <Button 
               icon={<PlusOutlined />} 
               style={{ 
                  fontWeight: 'normal', 
                  backgroundColor: '#FAE3B6', 
                  border: 'none' 
               }} 
               className="w-full sm:w-auto !py-3 sm:!py-4 !text-black !hover:text-black !rounded-xl text-base sm:!text-lg" 
               size="large"
               onClick={handleCreate}
            >
               <span className='hidden sm:inline'>Tạo yêu cầu hỗ trợ mới</span>
               <span className='inline sm:hidden'>Tạo yêu cầu mới</span>
            </Button>
         </div>

         <List
            dataSource={tickets}
            renderItem={(item) => (
               <Card
                  key={item?.ticketChatId}
                  className='!mb-3 hover:shadow cursor-pointer transition-all'
                  onClick={() => onSelect(item?.ticketChatSlug)}
               >
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0'>
                     <div className='flex-1 w-full sm:w-auto'>
                        <div className='font-medium text-base flex items-center gap-2'>
                           <MessageOutlined className='text-base sm:text-lg' /> 
                           <span className='text-base sm:text-lg line-clamp-1'>
                              {item?.title}
                           </span>
                        </div>
                        <div className='text-gray-500 text-sm sm:text-base mt-1 line-clamp-2 sm:line-clamp-1'>
                           {item?.lastMessage}
                        </div>
                        <div className='text-xs text-gray-400 mt-1'>
                           Tạo lúc: {formatDate(item?.createdAt)}
                        </div>
                     </div>
                     <div className='text-left sm:text-right w-full sm:w-auto'>
                        <Tag color='green' className='text-xs sm:text-sm'>
                           {item?.status === 'Open' ? 'Đang mở' : item?.status === 'Pending' ? 'Chờ nhân viên' : ''}
                        </Tag>
                     </div>
                  </div>
               </Card>
            )}
         />

         {/* Modal tạo cuộc trò chuyện mới */}
         <Modal
            title={<span className='text-lg sm:text-xl'>Tạo yêu cầu trò chuyện mới</span>}
            open={isModalOpen}
            onOk={handleSubmitNewChat}
            onCancel={() => setIsModalOpen(false)}
            okText='Tạo'
            cancelText='Hủy'
            centered
            className='modal-responsive'
            styles={{
               body: { padding: '20px' }
            }}
         >
            <Form layout='vertical' form={form}>
               <Form.Item
                  name='title'
                  label={<span className='text-sm sm:text-base'>Tiêu đề</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
               >
                  <Input 
                     placeholder='Nhập tiêu đề cuộc trò chuyện'
                     className='text-sm sm:text-base'
                     size='large'
                  />
               </Form.Item>

               <Form.Item 
                  name='message' 
                  label={<span className='text-sm sm:text-base'>Nội dung</span>}
               >
                  <Input.TextArea 
                     rows={3} 
                     placeholder='Nhập nội dung nếu bạn muốn gửi kèm'
                     className='text-sm sm:text-base'
                  />
               </Form.Item>
            </Form>
         </Modal>
      </>

   )
}

export default TicketChatList;