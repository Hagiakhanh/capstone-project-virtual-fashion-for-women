// app/dashboard/page.tsx

import React from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';

// Component Page chính
const DashboardPage: React.FC = () => {
    return (
        // Thêm padding hoặc container layout nếu cần
        <div className=" bg-gray-100">
            <Dashboard />
        </div>
    );
};

export default DashboardPage;