"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { OutfitCard } from "./OutfitCard";
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
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [suggestedOutfit, setSuggestedOutfit] = useState<ComponentSuggested[]>(
    []
  );
  const [isSuggestedMode, setIsSuggestedMode] = useState<boolean>(false);

  // 🌀 Auto scroll (vẫn giữ logic cũ)
  useEffect(() => {
    if (isAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAutoScroll]);

  useEffect(() => {
    if (suggestedOutfit == null || suggestedOutfit.length == 0) {
      setToNextState(1);
    }
  }, [suggestedOutfit]);

  // 📦 Lấy dữ liệu hội thoại ban đầu
  const handleGetAIConversation = async () => {
    if (!conversationID) return;
    try {
      const result = await api.get("/aiconversation/" + conversationID);
      const data = result.data?.data || result.data;
      setCurrentConversation(data);

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
    setToNextState(1);
  }, [conversationID]);

  // 💬 Gửi tin nhắn
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

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setIsSuggestedMode(false);
    setSuggestedOutfit([]);

    try {
      const response = await api.post(`/message/aiconversation`, {
        content: text,
        aiConversationID: currentConversation?.aiconversationId,
      });

      const aiResponse = response.data?.data || response.data;

      if (aiResponse?.components?.length > 0) {
        setSuggestedOutfit([...aiResponse.components]);
        setIsSuggestedMode(true);
        setToNextState(2);
      }

      setMessages((prev) => [
        ...prev,
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
      setMessages((prev) => [
        ...prev,
        { isBot: true, message: "❌ AI không phản hồi. Vui lòng thử lại." },
      ]);
    } finally {
      setIsTyping(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`${
        isSuggestedMode ? "md:w-2/3" : "md:w-1/2"
      } mx-auto p-4 mb-4`}
    >
      <Flex
        className={`mt-4 mx-auto ${
          isSuggestedMode ? "md:flex-row" : "md:justify-center"
        } flex-col`}
      >
        {isSuggestedMode && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-full bg-white rounded-2xl rounded-r-none shadow-lg p-4"
          >
            <h2 className="text-4xl w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent mb-4">
              ✨ Gợi ý trang phục
            </h2>
            <div className="flex justify-center flex-col gap-4 overflow-y-auto max-h-[650px] pr-2">
              {suggestedOutfit.map((outfit, index) => (
                <OutfitCard
                  key={index}
                  name={outfit.name}
                  imageUrl={outfit.ImageUrl}
                />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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

          {/* 💬 Danh sách tin nhắn */}
          <div
            ref={chatContainerRef}
            onScroll={() => {
              const el = chatContainerRef.current;
              if (!el) return;
              const isAtBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight < 100;
              setIsAutoScroll(isAtBottom);
            }}
            className="border border-solid h-[550px] rounded-lg overflow-y-scroll w-[90%] mx-auto px-4 pt-4 pb-2"
          >
            <AnimatePresence>
              {messages.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ChatMessage item={item} />
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatMessage
                    item={{ isBot: true, message: "...", isTyping: true }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* ✍️ Ô nhập chat */}
          <div className="w-[90%] mx-auto mt-4">
            <InputChatBoxComponent onSend={handleSendMessage} />
          </div>
        </motion.div>
      </Flex>
    </div>
  );
}
