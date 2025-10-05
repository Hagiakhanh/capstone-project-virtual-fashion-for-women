"use client";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessageComponent";
import { InputChatBoxComponent } from "./InputChatBoxComponent";
import { AIConversationDTO, ChatMessageItem } from "@/models/AIConversationDTO";
import { api } from "@/api/instance";

export function ChatMessageStage({
  setToNextState,
  setIsLoading,
  conversationID,
  isOnFlow,
}: {
  setToNextState: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  conversationID: number | null;
  isOnFlow: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<AIConversationDTO | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lấy dữ liệu hội thoại ban đầu
  const handleGetAIConversation = async () => {
    if (!conversationID) return;
    try {
      const result = await api.get("/aiconversation/" + conversationID);
      const data = result.data?.data || result.data;
      setCurrentConversation(data);

      // Map về ChatMessageItem[]
      const mappedMessages: ChatMessageItem[] = data.messages.map(
        (m: any): ChatMessageItem => ({
          id: m.messageId,
          isBot: m.isAiresponse,
          message: m.content,
          time: new Date(m.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      );
      setMessages(mappedMessages);
    } catch (error) {
      console.error("Lỗi khi lấy conversation:", error);
    }
  };

  useEffect(() => {
    handleGetAIConversation();
  }, [conversationID]);

  // Khi người dùng gửi tin nhắn
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !conversationID) return;

    const userMessage: ChatMessageItem = {
      isBot: false,
      message: text,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Thêm tin nhắn user và tin nhắn tạm của AI
    setMessages((prev) => [
      ...prev,
      userMessage,
      { isBot: true, message: "", isTyping: true },
    ]);
    setIsTyping(true);

    try {
      // Gửi tin nhắn user lên server
      const response = await api.post(`/message/aiconversation`, {
        content: text,
        aiConversationID: currentConversation?.aiconversationId,
      });

      const aiResponse = response.data?.data || response.data;

      // Cập nhật lại tin nhắn: xóa “typing”, thêm phản hồi thật
      setMessages((prev) => [
        ...prev.filter((m) => !m.isTyping),
        {
          isBot: true,
          message: aiResponse.content,
          time: new Date(aiResponse.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      // Xóa typing và thêm thông báo lỗi
      setMessages((prev) => [
        ...prev.filter((m) => !m.isTyping),
        {
          isBot: true,
          message: "❌ AI không phản hồi. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsTyping(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="md:w-1/2 bg-white rounded-2xl mt-4 shadow-lg p-4 mx-auto pb-4">
      <h2 className="text-6xl w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent">
        Mô tả nhu cầu của bạn
      </h2>

      {/* Danh sách tin nhắn */}
      <div className="border border-solid h-[550px] rounded-lg overflow-y-scroll w-[90%] mx-auto px-4 pt-4 pb-2">
        {messages.map((item, index) => (
          <ChatMessage key={index} item={item} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô nhập chat */}
      <InputChatBoxComponent onSend={handleSendMessage} />
    </div>
  );
}
