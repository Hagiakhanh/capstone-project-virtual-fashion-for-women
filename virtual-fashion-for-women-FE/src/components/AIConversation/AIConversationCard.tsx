"use client";
import React from "react";

interface AIConversationCardProps {
  conversation: any;
  onClick?: () => void;
}

export default function AIConversationCard({
  conversation,
  onClick,
}: AIConversationCardProps) {
  const { aiconversationId, currentUserStyleJson, createdAt } = conversation;

  let styleInfo: any = {};
  try {
    styleInfo = JSON.parse(currentUserStyleJson || "{}");
  } catch (error) {
    console.warn("JSON parse error:", error);
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("vi-VN");

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-400 transition"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-700">
          Cuộc trò chuyện #{aiconversationId}
        </h2>
        <span className="text-sm text-gray-500">
          Ngày tạo: {formatDate(createdAt)}
        </span>
      </div>

      <div className="mt-3 text-gray-600 text-sm">
        <p>
          <strong>Phong cách:</strong> {styleInfo.FashionStyle ?? "Không có"} –{" "}
          <strong>Trang phục:</strong> {styleInfo.ItemType ?? "Không có"}
        </p>
        <p>
          <strong>Dịp:</strong> {styleInfo.Occasion ?? "Không có"}
        </p>
      </div>
    </div>
  );
}
