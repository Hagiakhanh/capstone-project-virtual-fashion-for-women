"use client";
import { api } from "@/api/instance";
import AIConversationCard from "@/components/AIConversation/AIConversationCard";
import AIConversationDetailModal from "@/components/AIConversation/AIConversationDetailModal";
import React, { useEffect, useState } from "react";

export default function AIConversationManagementPage() {
  const [aiConversationList, setAiConversationList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );
  const fetchAIConversationSuggestionPagination = async ()=>{
    //
  }
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

  const handleViewDetail = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="max-w-6xl mx-auto font-sans p-6">
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
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}
