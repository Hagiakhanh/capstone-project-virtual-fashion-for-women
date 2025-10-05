"use client";

import { ChatMessageItem } from "@/models/AIConversationDTO";
import React from "react";
type ChatParams = {
  item: ChatMessageItem;
};
export const ChatMessage: React.FC<ChatParams> = ({ item }: ChatParams) => {
  return (
    <div
      key={item.id}
      className={`flex mb-4
            ${item.isBot ? "justify-start" : "justify-end"}
        `}
    >
      {item.isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          🤖
        </div>
      )}
      <div
        className={`
          rounded-2xl px-4 py-2 max-w-[70%] text-sm shadow-sm
          ${
            item.isBot ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"
          }`}
      >
        {item.isTyping ? (
          <span className="italic text-gray-500">... đang trả lời</span>
        ) : (
          item.message
        )}
        {item.time && (
          <div
            className={`
              text-xs mt-1
              ${item.isBot ? "text-gray-400" : "text-blue-100 text-right"}`}
          >
            {item.time}
          </div>
        )}
      </div>
    </div>
  );
};
