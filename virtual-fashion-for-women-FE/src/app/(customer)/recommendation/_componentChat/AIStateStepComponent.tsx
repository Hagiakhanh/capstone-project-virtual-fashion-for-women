"use client";

import { Steps } from "antd";
type AIStateStepParam = {
  currentStep: number;
};
function AIStateStepComponent({ currentStep }: AIStateStepParam) {
  return (
    <div className="bg-white rounded-full shadow-lg p-4">
      <Steps
        current={currentStep}
        percent={60}
        items={[
          {
            title: "Xác nhận thông tin",
          },
          {
            title: "Tìm hiểu mong muốn",
          },
          {
            title: "Gợi ý thời trang",
          },
        ]}
      />
    </div>
  );
}

export default AIStateStepComponent;
