'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/instance'
import TicketChatDetail from '@/components/TicketChat/TicketChatDetail'
import TicketChatList from '@/components/TicketChat/TicketChatList'
import { ItemTicketChatInformationDTO } from '@/models/TicketChatDTO'
import { messageToast } from '@/helpers/toastHelper'

export default function CustomerChatPage() {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
    const [ticketData, setTicketData] = useState<ItemTicketChatInformationDTO[]>([])

    const fetchTicketsChat = async () => {
        try {
            const response = await api.get('/ticketchat/customer/open-tickets')
            if (response.status === 200) {
                setTicketData(response.data?.data || [])
            } else {
                setTicketData([])
                messageToast.error('Không thể tải danh sách ticket chat.')
            }
        } catch (error) {
            messageToast.error('Không thể tải danh sách ticket chat.')
            console.error('Lỗi khi lấy danh sách ticket chat:', error)
        }
    }

    useEffect(() => {
        fetchTicketsChat()
    }, [selectedTicket])



    // Giao diện danh sách ticket
    return (
        <div >
            {!selectedTicket ? (
                <TicketChatList tickets={ticketData} onSelect={setSelectedTicket} fetchTicketsChat={fetchTicketsChat} />
            ) : (
                <TicketChatDetail onBack={setSelectedTicket} ticketSlug={selectedTicket} />
            )}
        </div>
    )
}
