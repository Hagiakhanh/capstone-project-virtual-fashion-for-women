'use client'

import { usePathname, useRouter } from 'next/navigation'
import { MessageSquare, Inbox, Archive } from 'lucide-react'

const tabs = [
  { label: 'Nhân viên - Bảng điều khiển', path: '/staff/ticketchat', icon: MessageSquare },
  { label: 'Nhân viên - Chat Hoạt động', path: '/staff/ticketchat/open-chat', icon: Inbox },
  { label: 'Lưu trữ Chat', path: '/staff/ticketchat/close-chat', icon: Archive },
]

export default function TicketChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="p-4 space-y-6">
      {/* Tabs điều hướng */}
      <div className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`text-lg cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2 font-normal transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Nội dung từng trang */}
      <div>{children}</div>
    </div>
  )
}
