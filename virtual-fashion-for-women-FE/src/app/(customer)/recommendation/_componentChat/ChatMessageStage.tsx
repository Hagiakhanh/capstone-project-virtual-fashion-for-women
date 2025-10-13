"use client";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessageComponent";
import { InputChatBoxComponent } from "./InputChatBoxComponent";
import {
  AIConversationDTO,
  ChatMessageItem,
  ComponentSuggested,
} from "@/models/AIConversationDTO";
import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";
import { Button, Flex, Typography } from "antd";
import { OutfitCard } from "./OutfitCard"; // Đảm bảo component này đã được import
const { Title, Text } = Typography;

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
  const [suggestedOutfit, setSuggestedOutfit] = useState<ComponentSuggested[]>(
    []
  );
  const [isSuggestedMode, setIsSuggestedMode] = useState<boolean>(false);

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
    // Ẩn chế độ gợi ý khi người dùng chat tiếp
    setIsSuggestedMode(false);
    setSuggestedOutfit([]);

    try {
      // Gửi tin nhắn user lên server
      const response = await api.post(`/message/aiconversation`, {
        content: text,
        aiConversationID: currentConversation?.aiconversationId,
      });

      const aiResponse = response.data?.data || response.data;

      // Cập nhật lại tin nhắn: xóa “typing”, thêm phản hồi thật
      if (aiResponse?.components != null && aiResponse.components.length > 0) {
        console.log(aiResponse.components);
        setSuggestedOutfit([...aiResponse.components]);
        setIsSuggestedMode(true);
        // setToNextState(2);
      }
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
    } catch (error: any) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      messageToast.error(error?.response?.data);
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
    <div
      className={` ${
        isSuggestedMode ? "md:w-2/3" : "md:w-1/2"
      }  mx-auto p-4 mb-4`}
    >
      {/* Container chính: Phần gợi ý (trái) + Phần Chat (phải) */}
      <Flex
        className={`mt-4 mx-auto ${
          isSuggestedMode ? "md:flex-row" : "md:justify-center"
        } flex-col`}
      >
        {/* Phần gợi ý Outfit - Chỉ hiển thị khi isSuggestedMode là true */}
        {isSuggestedMode && (
          <div className="md:w-full bg-white rounded-2xl rounded-r-none shadow-lg p-4">
            <h2 className="text-4xl w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent mb-4">
              ✨ Gợi ý trang phục
            </h2>
            <div className="flex justify-center flex-col gap-4 overflow-y-auto max-h-[650px] pr-2">
              {suggestedOutfit.map((outfit, index) => (
                // Giả định OutfitCard nhận 1 item gợi ý
                <OutfitCard
                  key={index}
                  name={outfit.name}
                  imageUrl={outfit.ImageUrl}
                />
              ))}
            </div>
          </div>
        )}

        <div
          className={`${
            isSuggestedMode
              ? "md:w-[600px] rounded-r-2xl rounded-l-none"
              : "md:w-full rounded-2xl"
          } bg-white shadow-lg p-4 pb-4`}
        >
          <h2
            className={`${
              isSuggestedMode ? "text-4xl" : "text-6xl"
            } w-full mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent`}
          >
            Mô tả nhu cầu của bạn
          </h2>
          {/* Danh sách tin nhắn */}
          <div className="border border-solid h-[550px] rounded-lg overflow-y-scroll w-[90%] mx-auto px-4 pt-4 pb-2">
            {messages.map((item, index) => (
              <ChatMessage key={index} item={item} />
            ))}
            {isTyping && (
              <ChatMessage
                item={{ isBot: true, message: "...", isTyping: true }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập chat */}
          <div className="w-[90%] mx-auto mt-4">
            <InputChatBoxComponent onSend={handleSendMessage} />
          </div>
        </div>
      </Flex>
    </div>
  );
}
