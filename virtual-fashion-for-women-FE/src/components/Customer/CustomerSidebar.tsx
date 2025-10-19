'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MessageCircle, CreditCard } from 'lucide-react';

const navItems = [
    { name: 'Thông tin tài khoản', href: '/account', icon: User },
    { name: 'Đơn hàng của bạn', href: '/account/orders', icon: Package },
    { name: 'Lịch sử đơn hàng', href: '/account/transactions', icon: CreditCard }, // ✅ Thêm tab mới
    { name: 'Lịch sử trò chuyện', href: '/account/chats', icon: MessageCircle },
];

export default function CustomerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="bg-white border border-gray-400 rounded-xl shadow-sm flex flex-col py-6 px-4 h-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Tài khoản</h2>
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                        item.href === '/account'
                            ? pathname === '/account'
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all
                                ${active
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }
                            `}
                        >
                            <Icon size={20} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
