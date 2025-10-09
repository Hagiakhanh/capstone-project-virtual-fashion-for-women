// app/recommendation/[conversationid]/page.tsx
"use client";

import { useState } from "react";
import { ChatMessageStage } from "../_componentChat/ChatMessageStage";
import AIStateStepComponent from "../_componentChat/AIStateStepComponent";

interface AIConversationDetailPageProps {
  params: { conversationid: string };
}

export default  function AIConversationDetailPage({
  params,
}: AIConversationDetailPageProps) {
  const resolvedParams = params; 
  const conversationIdNumber = Number(resolvedParams.conversationid);
  // nếu muốn kiểm tra invalid id
  if (isNaN(conversationIdNumber)) {
    console.error("Invalid conversation id:", params.conversationid);
  }

  // vì đã có conversationid => bắt đầu từ step 1
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    conversationIdNumber || null
  );

  return (
    <div className="bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-60% to-white">
      <div className="md:w-1/2 pt-4 mx-auto">
        <AIStateStepComponent currentStep={currentStep} />
      </div>

      {currentStep === 1 && (
        <ChatMessageStage
          conversationID={currentConversationId}
          setIsLoading={setIsLoading}
          setToNextState={setCurrentStep}
          isOnFlow={false}
        />
      )}

      {/* sau này có step 2,3 thì switch ở đây */}
    </div>
  );
}
