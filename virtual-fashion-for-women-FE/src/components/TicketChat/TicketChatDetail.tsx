'use client'
import { useEffect, useState, useRef } from 'react'
import { Button, Input } from 'antd'
import * as signalR from '@microsoft/signalr'
import { TicketMessageDetailDTO, TicketMessageResponseDTO } from '@/models/TicketChatDTO'
import { api } from '@/api/instance'
import { useAuth } from '@/contexts/AuthContext'
import formatDate from '@/utils/formatDate'
import { messageToast } from '@/helpers/toastHelper'

export default function TicketChatDetail({
   ticketSlug,
   onBack
}: {
   ticketSlug: string
   onBack: (slug: string | null) => void
}) {
   const [messages, setMessages] = useState<TicketMessageResponseDTO>()
   const [input, setInput] = useState('')
   const [loading, setLoading] = useState(true)
   const { user } = useAuth();
   const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
   const chatBoxRef = useRef<HTMLDivElement>(null)
   const messagesRef = useRef(messages);

   const fetchMessages = async () => {
      setLoading(true)
      try {
         const response = await api.get('/ticketchat/messages/' + ticketSlug);
         if (response.status === 200) {
            setMessages(response.data?.data);
         }
      } catch (error) {
         messageToast.error('Không thể tải tin nhắn.')
         console.error('Lỗi khi lấy tin nhắn:', error)
      } finally {
         setLoading(false)
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

   useEffect(() => {
      fetchMessages()
      window.scrollTo({ top: 0, behavior: 'auto' });
   }, [ticketSlug])

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

      connection.on("TicketClosed", (data: any) => {
         const currentMessages = messagesRef.current;

         if (data?.ticketChatId == currentMessages?.ticketChatId) {
            onBack(null);
            messageToast.info("Hỗ trợ đã bị đóng bởi nhân viên.");
         }
      });

      connection.onclose(() => {
         console.warn('⚠️ SignalR disconnected, will auto reconnect...')
      })

      return () => {
         connection.off('ReceiveMessage')
         connection.off('TicketClosed')
         connection.stop()
      }
   }, [connection])

   useEffect(() => {
      if (!loading) {
         scrollToBottom()
      }
      messagesRef.current = messages;
   }, [messages])

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

   return (
      <div className='p-4'>
         <Button onClick={() => onBack(null)} className='mb-4' style={{ fontSize: '18px', fontWeight: 'normal' }}>
            Quay lại danh sách
         </Button>

         <div className='bg-white rounded-xl shadow p-4'>
            {/* Header */}
            <div className='border-b pb-2 mb-3 flex gap-2 items-center'>
               <h3 className='text-lg font-semibold'>{messages?.title}</h3>
               <span className='text-base text-gray-400'>#{messages?.ticketChatId}</span>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <div ref={chatBoxRef}
               className='h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-md flex flex-col gap-2'>
               {loading ? (
                  <p>Đang tải tin nhắn...</p>
               ) : (
                  <>
                     {messages?.messages.map((msg) => {
                        return (
                           <div
                              key={msg.messageId}
                              className={`flex ${msg?.ownerRole?.toLowerCase() == user?.role?.toLowerCase() ? 'justify-end' : 'justify-start'}`}
                           >
                              <div
                                 className={`max-w-[70%] rounded-2xl px-3 py-2 bg-blue-500 text-white rounded-br-none`}
                              >
                                 <p className='text-base whitespace-pre-wrap'>{msg.content}</p>
                                 <p className='text-sm text-gray-300 mt-1 text-right'>
                                    {formatDate(msg?.createdAt)}
                                 </p>
                              </div>
                           </div>
                        )
                     })}
                  </>
               )}
            </div>

            {/* Ô nhập và nút gửi */}
            {
               messages?.ticketStatus?.startsWith('Open') || messages?.ticketStatus?.startsWith('Pending') ? (
                  <div className='mt-4 flex gap-2'>
                     <Input
                        placeholder='Nhập tin nhắn...'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={handleSend}
                        style={{ fontSize: '16px' }}
                     />
                     <Button type='primary' onClick={handleSend} style={{ fontSize: '16px' }}>
                        Gửi
                     </Button>
                  </div>
               ) : (
                  <></>
               )
            }

         </div>

      </div>
   )
}
