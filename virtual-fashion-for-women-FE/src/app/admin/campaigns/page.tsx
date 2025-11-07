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
          <AntButtonCommon
            onClick={() => {
              router.push("campaigns/create");
            }}
            label="Tạo chiến dịch"
            style={{ margin: 0 }}
            icon={<Pencil/>} 
            iconPosition="end"
          />
        </div>
        <SaleCampaignTable />
      </div>
    </div>
  );
}
