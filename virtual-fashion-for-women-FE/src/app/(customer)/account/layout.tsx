import CustomerSidebar from "@/components/Customer/CustomerSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
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
