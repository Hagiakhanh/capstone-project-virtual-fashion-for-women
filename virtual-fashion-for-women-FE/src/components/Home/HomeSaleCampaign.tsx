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
      <div className="container mx-auto px-3 sm:px-4 my-6 sm:my-10 text-center text-base sm:text-lg md:text-xl text-gray-500">
        Đang tải các chiến dịch khuyến mãi...
      </div>
    );
  }

  if (listActiveSaleCampaign.length === 0) {
    return (
      <div className="container mx-auto px-3 sm:px-4 my-6 sm:my-10 text-center text-base sm:text-lg md:text-xl text-gray-500">
        Hiện không có chiến dịch khuyến mãi nào đang hoạt động.
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] mx-auto px-2 sm:px-0">
      {/* Tiêu đề responsive */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mt-4 sm:mt-6 md:mt-8 mb-3 sm:mb-4 px-2 leading-tight">
        <span className="inline-block">🔥</span>
        <span className="mx-2">Chương Trình Khuyến Mãi Đặc Biệt</span>
        <span className="inline-block">🔥</span>
      </h1>
      
      {/* Danh sách campaign với spacing responsive */}
      {listActiveSaleCampaign.map((campaignData) => (
        <div 
          key={campaignData.campaignId}
          className="w-full"
        >
          <SaleCampaignBoxView campaignData={campaignData} />
        </div>
      ))}
    </div>
  )
}