'use client'

import { useEffect, useState } from 'react'
import { api } from '@/api/instance'
import TicketChatDetail from '@/components/TicketChat/TicketChatDetail'
import TicketChatList from '@/components/TicketChat/TicketChatList'

export default function CustomerChatPage() {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
    const [ticketData, setTicketData] = useState<any[]>([])

    const fetchTicketsChat = async () => {
        try {
            const response = await api.get('/ticketchat/customer/open-tickets')
            if (response.status === 200) {
                setTicketData(response.data?.data || [])
            } else {
                setTicketData([])
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách ticket chat:', error)
        }
    }

    useEffect(() => {
        fetchTicketsChat()
    }, [selectedTicket])



    // Giao diện danh sách ticket
    return (
        <div className='p-6'>
            {!selectedTicket ? (
                <TicketChatList tickets={ticketData} onSelect={setSelectedTicket} />
            ) : (
                <TicketChatDetail onBack={setSelectedTicket} ticketSlug={selectedTicket} />
            )}
        </div>
    )
}
