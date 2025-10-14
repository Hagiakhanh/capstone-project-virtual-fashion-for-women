"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export const InputChatBoxComponent: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white">
      <div className="flex items-center border-t border-gray-200 mt-4 pt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập mô tả phong cách của bạn..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
