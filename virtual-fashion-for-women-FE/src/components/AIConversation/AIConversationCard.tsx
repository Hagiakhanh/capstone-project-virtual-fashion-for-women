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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Format ngắn cho mobile, đầy đủ cho desktop
    return {
      short: date.toLocaleDateString("vi-VN"),
      full: date.toLocaleString("vi-VN"),
    };
  };

  const dateFormatted = formatDate(createdAt);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white shadow-md rounded-xl p-3 sm:p-4 md:p-5 border border-gray-100 hover:shadow-lg hover:border-blue-400 transition-all duration-200 active:scale-[0.98]"
    >
      {/* Header - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="font-semibold text-base sm:text-lg md:text-xl text-gray-700 truncate">
          Cuộc trò chuyện #{aiconversationId}
        </h2>
        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          {/* Hiển thị ngắn trên mobile, đầy đủ trên desktop */}
          <span className="sm:hidden">📅 {dateFormatted.short}</span>
          <span className="hidden sm:inline">
            Ngày tạo: {dateFormatted.full}
          </span>
        </span>
      </div>

      {/* Content - responsive text */}
      <div className="mt-2 sm:mt-3 text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-1.5">
        {/* Row 1: Phong cách & Trang phục */}
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <p className="flex items-baseline gap-1">
            <strong className="text-gray-700">Phong cách:</strong>
            <span className="text-gray-600">
              {styleInfo.FashionStyle ?? "Không có"}
            </span>
          </p>
          {/* <span className="text-gray-400 hidden sm:inline">–</span>
          <p className="flex items-baseline gap-1">
            <strong className="text-gray-700">Trang phục:</strong>
            <span className="text-gray-600">
              {styleInfo.ItemType ?? "Không có"}
            </span>
          </p> */}
        </div>

        {/* Row 2: Dịp */}
        <p className="flex items-baseline gap-1">
          <strong className="text-gray-700">Dịp:</strong>
          <span className="text-gray-600">
            {styleInfo.Occasion ?? "Không có"}
          </span>
        </p>
      </div>

      {/* Optional: Visual indicator cho clickable */}
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex justify-end">
        <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
          Xem chi tiết
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}