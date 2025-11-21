// components/dashboard/Dashboard.tsx
"use client";

import React, { useState } from "react";
import { LayoutDashboard, ShoppingBag, Brain } from 'lucide-react'; 

import OverviewTab from "./OverviewTab";
// import ProductsTab from "./ProductsTab";
// import AITab from "./AITab";

interface Tab {
    id: 'overview' | 'products' | 'ai';
    name: string;
    icon: React.ElementType | null;
}

const tabs: Tab[] = [
    { id: 'overview', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', name: 'Sản Phẩm', icon: ShoppingBag },
    { id: 'ai', name: 'Trí tuệ nhân tạo', icon: Brain },
];

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'ai'>('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            // case 'products':
            //     return <ProductsTab />;
            // case 'ai':
            //     return <AITab />;
            default:
                return <OverviewTab />; 
        }
    };

    return (
        <div className="bg-gray-50"> 
            <div className="mx-auto flex-1 flex flex-col"> 
                <div className="flex items-center justify-between mb-2">
                    {/* Header */}
                    <h1 className="text-3xl uppercase font-sans font-bold text-black">Dashboard</h1>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-3 font-sans">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                                        active
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {Icon && <Icon size={18} />}
                                    <span className="text-sm font-medium">{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Nội dung Tab */}
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}