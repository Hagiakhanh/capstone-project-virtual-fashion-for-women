// export default function AdminPage() {
//     return (
//       <div>
//         <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
//         <p className="mt-2 text-gray-600">This is your main admin content.</p>
//       </div>
//     );
//   }
// src/app/admin/product/page.tsx
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
