"use client";

import { Steps } from "antd";
type AIStateStepParam = {
  currentStep: number;
};

function AIStateStepComponent({ currentStep }: AIStateStepParam) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-full shadow-lg p-3 sm:p-4 md:p-6 mx-2 sm:mx-4">
      <Steps
        current={currentStep}
        percent={60}
        // Responsive: hiển thị vertical trên mobile nhỏ, horizontal trên tablet+
        direction="horizontal"
        // Giảm size trên mobile
        size="small"
        className="custom-steps"
        items={[
          {
            title: (
              <span className="text-xs sm:text-sm md:text-base">
                Xác nhận thông tin
              </span>
            ),
          },
          {
            title: (
              <span className="text-xs sm:text-sm md:text-base">
                Tìm hiểu mong muốn
              </span>
            ),
          },
          {
            title: (
              <span className="text-xs sm:text-sm md:text-base">
                Gợi ý thời trang
              </span>
            ),
          },
        ]}
      />
      
      <style jsx global>{`
        /* Responsive cho Steps component */
        @media (max-width: 640px) {
          .custom-steps .ant-steps-item-title {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          
          .custom-steps .ant-steps-item-icon {
            width: 24px !important;
            height: 24px !important;
            font-size: 12px !important;
          }
          
          .custom-steps .ant-steps-item-content {
            margin-top: 4px !important;
          }
          
          /* Giảm khoảng cách giữa các step */
          .custom-steps .ant-steps-item {
            padding-inline-start: 8px !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .custom-steps .ant-steps-item-title {
            font-size: 13px !important;
          }
          
          .custom-steps .ant-steps-item-icon {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AIStateStepComponent;