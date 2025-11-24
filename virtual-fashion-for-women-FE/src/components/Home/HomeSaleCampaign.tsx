"use client"
import React, { useEffect, useState } from 'react'
import { SaleCampaignBoxView } from '../SaleCampaign/SaleCampaignBoxView'
import { apiToken } from '@/api/instance';
import { ResponseGetShortSaleCampaignDetail } from '@/models/ResponseGetShortSaleCampaignDetail';

export const HomeSaleCampaign = () => {
  const [listActiveSaleCampaign, setListActiveCampaign] = useState<ResponseGetShortSaleCampaignDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchListActiveCampaign = async () => {
    try {
      // 1. Gửi request đến API
      const response = await apiToken.get("/salecampaign/active"); 
      const dataResponse = response.data;

      if (dataResponse && Array.isArray(dataResponse.data)) {
        setListActiveCampaign(dataResponse.data);
      } else if (Array.isArray(dataResponse)) {
        setListActiveCampaign(dataResponse); 
      }

    } catch (error) {
      console.error("Error fetching sale campaigns:", error);
      setListActiveCampaign([]); 
    } finally {
      setIsLoading(false); 
    }
  }

  useEffect(() => {
    fetchListActiveCampaign();
  }, []) 

  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 my-10 text-center text-xl text-gray-500">
        Đang tải các chiến dịch khuyến mãi...
      </div>
    );
  }

  if (listActiveSaleCampaign.length === 0) {
    return (
      <div className="container mx-auto px-4 my-10 text-center text-xl text-gray-500">
        Hiện không có chiến dịch khuyến mãi nào đang hoạt động.
      </div>
    );
  }

  return (
    <div className="space-y-12 w-[80%] mx-auto">
      <h1 className="text-3xl font-extrabold text-center mt-8 mb-4">🔥 Chương Trình Khuyến Mãi Đặc Biệt 🔥</h1>
      {/* 5. Lặp qua danh sách và truyền dữ liệu cho từng SaleCampaignBoxView */}
      {listActiveSaleCampaign.map((campaignData) => (
        <div key={campaignData.campaignId}>
          <SaleCampaignBoxView campaignData={campaignData} />
        </div>
      ))}
    </div>
  )
}