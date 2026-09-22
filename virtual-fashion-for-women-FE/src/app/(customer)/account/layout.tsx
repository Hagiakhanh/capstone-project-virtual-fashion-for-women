'use client';

import CustomerSidebar from "@/components/Customer/CustomerSidebar";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (showSidebar) {
            setShowSidebar(false);
        }
    }, [pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isMobile && showSidebar) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, showSidebar]);

    // Mobile view
    if (isMobile) {
        return (
            <div className="w-full bg-gray-50">
                {/* Modal Sidebar Overlay */}
                <div
                    className={`fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 transition-all duration-300 ease-out ${showSidebar
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible pointer-events-none'
                        }`}
                    onClick={() => setShowSidebar(false)}
                >
                    {/* Semi-transparent backdrop */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                    {/* Sidebar Modal */}
                    <div
                        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out ${showSidebar
                            ? 'scale-100 translate-y-0 opacity-100'
                            : 'scale-95 -translate-y-4 opacity-0'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>

                        {/* Sidebar content with custom scrollbar */}
                        <div className="overflow-y-auto p-1 custom-scrollbar">
                            <CustomerSidebar />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full">
                    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800">Tài khoản</h1>
                    </div>
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop view (original layout)
    return (
        <div className="flex w-full max-w-[1600px] mx-auto px-2 py-8 items-start h-auto">
            <div className="w-60 mr-8 ml-4">
                <CustomerSidebar />
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm p-6 mr-2 border border-gray-400">
                {children}
            </div>
        </div>
    );
}