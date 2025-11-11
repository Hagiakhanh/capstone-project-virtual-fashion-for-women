'use client';

import { Button, Input, Modal } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react';
import { TicketMessageDetailDTO, TicketMessageResponseDTO } from '@/models/TicketChatDTO';
import { api } from '@/api/instance';
import { useAuth } from '@/contexts/AuthContext';
import formatDate from '@/utils/formatDate';
import * as signalR from '@microsoft/signalr'
import { messageToast } from '@/helpers/toastHelper';

function StaffTicketChatDetail({ ticketSlug, onBack }: { ticketSlug: string, onBack: (slug: string | null) => void }) {

   const [messages, setMessages] = useState<TicketMessageResponseDTO>()
   const { user } = useAuth();
   const chatBoxRef = useRef<HTMLDivElement>(null)
   const [input, setInput] = useState('')
   const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
   const [loading, setLoading] = useState(true)

   const fetchMessages = async () => {
      setLoading(true);
      try {
         const response = await api.get('/ticketchat/messages/' + ticketSlug);
         if (response.status === 200) {
            setMessages(response.data?.data);
         }

      } catch (error) {
         messageToast.error('Không thể tải tin nhắn.')
         console.error('Lỗi khi lấy tin nhắn:', error)
      } finally {
         setLoading(false);
         setTimeout(scrollToBottom, 200)
      }
   }

   const scrollToBottom = () => {
      if (chatBoxRef.current) {
         chatBoxRef.current.scrollTo({
            top: chatBoxRef.current.scrollHeight,
            behavior: 'smooth',
         })
      }
   }

   const handleSend = async () => {
      if (!input.trim()) return
      const payload = {
         ticketSlug: messages?.ticketChatSlug,
         content: input.trim(),
      }
      try {
         const response = await api.post('/ticketchat/send-message', payload)
         if (response.status === 200) {
            setInput('')
         }

      } catch (error) {
         messageToast.error('Lỗi không thể gửi tin nhắn.')
         console.error('Lỗi khi gửi tin nhắn:', error)
      }
   }

   const handleConfirm = async () => {
      try {
         const response = await api.put(`/ticketchat/close/${messages?.ticketChatId}`);
         if (response.status === 200) {
            setIsModalOpen(false);
            onBack(null);
            messageToast.success('Đóng hỗ trợ thành công');
         } else {
            messageToast.error('Đóng hỗ trợ thất bại');
         }

      } catch (error) {
         console.error('Lỗi khi hoàn tất hỗ trợ:', error)
      }
   }

   useEffect(() => {
      const newConnection = new signalR.HubConnectionBuilder()
         .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/chathub`, {
            withCredentials: true
         })
         .withAutomaticReconnect()
         .configureLogging(signalR.LogLevel.Information)
         .build()

      setConnection(newConnection)
   }, [])

   useEffect(() => {
      if (!connection) return

      const startConnection = async () => {
         try {
            await connection.start().then(() => {
               console.log('SignalR connected successfully!')
            }).catch((err) => {
               console.error('SignalR connection failed:', err)
            })
            await connection.invoke('JoinTicketGroup', ticketSlug)
            console.log('Joined group:', ticketSlug)
         } catch (err) {
            console.error('SignalR connection error:', err)
         }
      }

      startConnection()

      // Lắng nghe sự kiện tin nhắn mới
      connection.on('ReceiveMessage', (message: TicketMessageDetailDTO) => {
         console.log('Nhận tin nhắn mới:', message)
         setMessages((prev) => {
            if (!prev) return prev;
            return {
               ...prev,
               messages: [...prev.messages, message],
            };
         });


      })

      connection.onclose(() => {
         console.warn('⚠️ SignalR disconnected, will auto reconnect...')
      })

      return () => {
         connection.off('ReceiveMessage')
         connection.stop()
      }
   }, [connection])

   useEffect(() => {
      fetchMessages();
   }, [ticketSlug]);

   useEffect(() => {
      if (!loading) {
         scrollToBottom()
      }
   }, [messages])


   return (
      <div className="rounded-xl shadow-sm bg-white flex flex-col h-[70vh] p-4">
         {/* Header */}
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
               <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => onBack(null)}
                  type="text"
               />
               <div>
                  <div className="font-semibold text-lg">{messages?.title}</div>
                  <div className="text-gray-500 text-sm">
                     Ticket #{messages?.ticketChatId}
                  </div>
               </div>
            </div>
            {messages?.ticketStatus?.startsWith('Open') ? (
               <>
                  <Button
                     type="primary"
                     danger
                     className='!text-base !font-normal'
                     onClick={() => setIsModalOpen(true)}
                  >
                     Hoàn tất hỗ trợ
                  </Button>
               </>
            ) : (<>

            </>)}

         </div>

         {/* Modal xác nhận */}
         <Modal
            title="Xác nhận hoàn tất hỗ trợ"
            open={isModalOpen}
            onOk={handleConfirm}
            onCancel={() => setIsModalOpen(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
         >
            <p>Bạn có chắc chắn muốn đánh dấu phiên hỗ trợ này là <b>hoàn tất</b> không?</p>
            <p>Sau khi xác nhận, bạn sẽ không thể gửi thêm tin nhắn trong cuộc trò chuyện này.</p>
         </Modal>
         {loading ? (<p>Đang tải tin nhắn...</p>) : <>

            {/* Vùng tin nhắn */}
            <div ref={chatBoxRef} className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto flex flex-col gap-3">
               {messages?.messages?.map((msg) => (
                  <div
                     key={msg.messageId}
                     className={`flex ${msg.ownerRole?.toLowerCase() === user?.role?.toLowerCase() ? 'justify-end' : 'justify-start'
                        }`}
                  >
                     <div
                        className={`px-4 py-2 rounded-2xl max-w-[70%] text-base  bg-blue-500 text-white rounded-br-none`}
                     >
                        <div>{msg.content}</div>
                        <div
                           className={`text-xs mt-1 `}
                        >
                           {formatDate(msg.createdAt)}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Input chat */}
            {messages?.ticketStatus?.startsWith('Open') ? (
               <>
                  <div className="mt-3 flex items-center gap-2">
                     <Input
                        placeholder="Nhập tin nhắn..."
                        style={{ fontSize: '16px' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={handleSend}
                     />
                     <Button type="primary" onClick={handleSend}>Gửi</Button>
                  </div>
               </>
            ) : (
               <></>
            )}

         </>}

      </div>

   );
}

export default StaffTicketChatDetail;