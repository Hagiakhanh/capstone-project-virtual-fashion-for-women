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
    <div className="mx-auto font-sans pb-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Các cuộc trò chuyện với AI
      </h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : aiConversationList.length === 0 ? (
        <p>Chưa có cuộc trò chuyện nào.</p>
      ) : (
        <div className="grid gap-4">
          {aiConversationList.map((item) => (
            <AIConversationCard
              key={item.aiconversationId}
              conversation={item}
              onClick={() => handleViewDetail(item)}
            />
          ))}
        </div>
      )}

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
