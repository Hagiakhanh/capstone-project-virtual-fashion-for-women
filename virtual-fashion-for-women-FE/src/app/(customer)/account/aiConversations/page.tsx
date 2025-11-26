"use client";
import { api } from "@/api/instance";
import AIConversationCard from "@/components/AIConversation/AIConversationCard";
import AIConversationDetailModal from "@/components/AIConversation/AIConversationDetailModal";
import { AIConversationDTO } from "@/models/AIConversationDTO";
import React, { useEffect, useState } from "react";

export default function AIConversationManagementPage() {
  const [aiConversationList, setAiConversationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const [listSuggested, setListSuggested] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageSize: 3,
    pageCurrent: 1,
    totalRecords: 0,
  });

  // 🧩 Hàm load danh sách outfit cho 1 cuộc trò chuyện
  const fetchAIConversationSuggestionPagination = async (
    conversation: AIConversationDTO,
    page: number = 1
  ) => {
    try {
      const response = await api.get(
        `/aiconversation/${conversation.aiconversationId}/suggested-outfits?pageSize=${pagination.pageSize}&pageCurrent=${page}`
      );
      const data = response?.data;
      setPagination((prev) => ({
        ...prev,
        pageCurrent: page,
        totalRecords: data?.totalRecords || 0,
      }));

      setListSuggested(data.data || []);
    } catch (error) {
      console.error("Error fetching suggested outfits:", error);
      setListSuggested([]);
    }
  };

  // 🧩 Hàm load danh sách tất cả cuộc trò chuyện
  const fetchAiConversationPagination = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/aiconversation`);
      const aiConversationResponse = response.data?.data || response.data;
      setAiConversationList(aiConversationResponse || []);
    } catch (error) {
      console.error("Error fetching AI conversation list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiConversationPagination();
  }, []);

  const handleViewDetail = async (conversation: any) => {
    setSelectedConversation(conversation);
    await fetchAIConversationSuggestionPagination(conversation, 1);
  };

  const handleChangePage = async (page: number) => {
    if (selectedConversation) {
      await fetchAIConversationSuggestionPagination(selectedConversation, page);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 font-sans pb-4 sm:pb-6">
      {/* Tiêu đề responsive */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 sm:mb-5 md:mb-6 text-gray-800 text-center sm:text-left">
        Các cuộc trò chuyện với AI
      </h1>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <p className="text-base sm:text-lg text-gray-600">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : aiConversationList.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 text-center px-4">
            Chưa có cuộc trò chuyện nào.
          </p>
          <p className="text-sm sm:text-base text-gray-500 mt-2 text-center px-4">
            Bắt đầu trò chuyện với AI để nhận gợi ý trang phục phù hợp!
          </p>
        </div>
      ) : (
        // Grid danh sách conversation - responsive
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {aiConversationList.map((item) => (
            <div
              key={item.aiconversationId}
              className="transform transition-transform duration-200 hover:scale-[1.02]"
            >
              <AIConversationCard
                conversation={item}
                onClick={() => handleViewDetail(item)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedConversation && (
        <AIConversationDetailModal
          conversation={selectedConversation}
          listSuggested={listSuggested}
          pagination={pagination}
          onPageChange={handleChangePage}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}