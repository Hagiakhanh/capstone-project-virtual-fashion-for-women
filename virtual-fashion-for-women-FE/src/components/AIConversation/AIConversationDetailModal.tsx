"use client";
import React from "react";

interface AIConversationDetailModalProps {
  conversation: any;
  onClose: () => void;
}

export default function AIConversationDetailModal({
  conversation,
  onClose,
}: AIConversationDetailModalProps) {
  const {
    messages = [],
    suggestedOutfits = [],
    currentUserStyleJson,
  } = conversation;

  let styleInfo: any = {};
  try {
    styleInfo = JSON.parse(currentUserStyleJson || "{}");
  } catch (error) {
    console.warn("JSON parse error:", error);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Chi tiết cuộc trò chuyện #{conversation.aiconversationId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">
            Thông tin phong cách người dùng
          </h3>
          <ul className="list-disc pl-5 text-gray-600 text-sm">
            <li>Phong cách: {styleInfo.FashionStyle ?? "Không có"}</li>
            <li>Trang phục: {styleInfo.ItemType ?? "Không có"}</li>
            <li>Dịp: {styleInfo.Occasion ?? "Không có"}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Tin nhắn</h3>
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    msg.isFromUser
                      ? "bg-blue-50 text-gray-800 self-end"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <strong>{msg.isFromUser ? "Người dùng:" : "AI:"}</strong>{" "}
                  {msg.content}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có tin nhắn nào.</p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-medium mb-2 text-gray-700">
            Gợi ý trang phục
          </h3>
          {suggestedOutfits.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {suggestedOutfits.map((outfit: any, index: number) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 text-sm bg-gray-50 hover:shadow-md transition"
                >
                  <p>
                    <strong>Tên:</strong> {outfit.name}
                  </p>
                  <p>
                    <strong>Mô tả:</strong> {outfit.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Chưa có gợi ý trang phục nào.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
