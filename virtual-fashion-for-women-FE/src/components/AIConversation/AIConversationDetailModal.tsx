"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AntButtonCommon } from "../AntDesign/Button/AntButtonCommon";
import { useRouter } from "next/navigation";
import { ArrowRightOutlined } from "@ant-design/icons";

interface AIConversationDetailModalProps {
  conversation: any;
  listSuggested: any[];
  pagination: {
    pageSize: number;
    pageCurrent: number;
    totalRecords: number;
  };
  onPageChange: (page: number) => void;
  onClose: () => void;
}

const AIConversationDetailModal: React.FC<AIConversationDetailModalProps> = ({
  conversation,
  listSuggested = [],
  pagination,
  onPageChange,
  onClose,
}) => {
  const router = useRouter();
  const totalPages = Math.ceil(
    (pagination.totalRecords || listSuggested.length) / pagination.pageSize
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Chi tiết cuộc trò chuyện #{conversation.aiconversationId}
          </h2>
          <p className="text-gray-500 mb-4">
            Ngày tạo: {new Date(conversation.createdAt).toLocaleString("vi-VN")}
          </p>
          <AntButtonCommon
            colorType="primary"
            onClick={() => {
              router.push("/recommendation/" + conversation.aiconversationId);
            }}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            className="mb-4"
          >
            Đi tới cuộc trò chuyện
          </AntButtonCommon>
          <h3 className="text-lg font-semibold mb-3">Danh sách gợi ý:</h3>
          {listSuggested.length === 0 ? (
            <p>Không có gợi ý nào.</p>
          ) : (
            <div className="space-y-4">
              {listSuggested.map((suggestion, index) => (
                <div
                  key={suggestion.suggestedOutfitId || index}
                  className="border rounded-lg p-4 bg-gray-50 cursor-pointer"
                  onClick={() => {
                    sessionStorage.setItem(
                      "selectedSuggestion",
                      JSON.stringify(suggestion)
                    );
                    router.push(
                      `/recommendation/${conversation.aiconversationId}`
                    );
                  }}
                >
                  <p className="font-semibold text-gray-700 mb-2">
                    🪶 {suggestion.reason}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestion.productVariants.map((variant: any) => (
                      <div
                        key={variant.productVariantId}
                        className="bg-white rounded-lg border overflow-hidden shadow-sm"
                      >
                        <img
                          src={variant.imageUrl}
                          alt={variant.variantName}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-2 text-sm">
                          <p className="font-medium line-clamp-2">
                            {variant.variantName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🔹 Thanh phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() =>
                  onPageChange(Math.max(1, pagination.pageCurrent - 1))
                }
                disabled={pagination.pageCurrent === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Trang trước
              </button>
              <span className="text-gray-700">
                Trang {pagination.pageCurrent}/{totalPages}
              </span>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, pagination.pageCurrent + 1))
                }
                disabled={pagination.pageCurrent >= totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Trang sau
              </button>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIConversationDetailModal;
