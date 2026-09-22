"use client";

import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import { SaleCampaignTable } from "./_index/SaleCampaignTable";
import { useRouter } from "next/navigation";
import { Pencil } from 'lucide-react';

export default function SaleCampaignMangementPage() {
  const router = useRouter();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-12">
          <h1 className="text-3xl font-semibold text-gray-800 ">
            Quản lý các chiến dịch
          </h1>
          <button
                    className="bg-blue-600 flex gap-2 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
            onClick={() => {
              router.push("campaigns/create");
            }}
            style={{ margin: 0 }} 
          ><Pencil/> Tạo chiến dịch</button>
        </div>
        <SaleCampaignTable />
      </div>
    </div>
  );
}
