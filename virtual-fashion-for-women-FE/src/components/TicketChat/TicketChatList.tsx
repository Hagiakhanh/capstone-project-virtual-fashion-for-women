'use client'

import { useState } from 'react'
import { Button, Card, List, Tag, Modal, Input, Form } from 'antd'
import { MessageOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '@/api/instance'
import { messageToast } from '@/helpers/toastHelper'
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO'
import formatDate from '@/utils/formatDate'

function TicketChatList({ tickets, onSelect }: { tickets: ItemTicketChatInformationDTO[], onSelect: (slug: string) => void }) {
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
            messageToast.success('Tạo yêu cầu hỗ trợ mới thành công')
            setIsModalOpen(false)
         }

      } catch (error) {
         console.error('Lỗi khi tạo ticket chat:', error)
      }

   }

   return (
      <>
         {/* Phần header bên trên */}
         <div className='flex justify-between items-center mb-4'>
            <h2 className='text-3xl font-semibold text-gray-800 mb-6'>Yêu cầu hỗ trợ</h2>
            <Button icon={<PlusOutlined />} style={{ fontWeight: 'normal', backgroundColor: '#FAE3B6', border: 'none' }} className="!py-4 !text-black !hover:text-black !rounded-xl !text-lg" size="large"
               onClick={handleCreate}>
               Tạo yêu cầu hỗ trợ mới
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
                  <div className='flex justify-between items-center'>
                     <div>
                        <div className='font-medium text-base flex items-center gap-2'>
                           <MessageOutlined /> <span className='text-lg'>{item?.title}</span>
                        </div>
                        <div className='text-gray-500 text-base'>{item?.lastMessage}</div>
                        <div className='text-xs text-gray-400'>
                           Tạo lúc: {formatDate(item?.createdAt)}
                        </div>
                     </div>
                     <div className='text-right'>
                        <Tag color='green'>
                           {item?.status === 'Open' ? 'Đang mở' : item?.status === 'Pending' ? 'Chờ nhân viên' : ''}
                        </Tag>
                     </div>
                  </div>
               </Card>
            )}
         />

         {/* Modal tạo cuộc trò chuyện mới */}
         <Modal
            title={<span style={{ fontSize: '20px' }}>Tạo yêu cầu trò chuyện mới</span>}
            open={isModalOpen}
            onOk={handleSubmitNewChat}
            onCancel={() => setIsModalOpen(false)}
            okText='Tạo'
            cancelText='Hủy'
         >
            <Form layout='vertical' form={form}>
               <Form.Item
                  name='title'
                  label={<span style={{ fontSize: '16px' }}>Tiêu đề</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
               >
                  <Input placeholder='Nhập tiêu đề cuộc trò chuyện' />
               </Form.Item>

               <Form.Item name='message' label={<span style={{ fontSize: '16px' }}>Nội dung</span>}>
                  <Input.TextArea rows={3} placeholder='Nhập nội dung nếu bạn muốn gửi kèm' />
               </Form.Item>
            </Form>
         </Modal>
      </>

   )
}

export default TicketChatList;