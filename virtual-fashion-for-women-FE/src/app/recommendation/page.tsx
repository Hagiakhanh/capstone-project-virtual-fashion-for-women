"use client";
import React, { useState } from "react";
import AIStateStepComponent from "./_componentChat/AIStateStepComponent";
import ChatBoxContainer from "./_componentChat/ChatBoxContainer";

export default function RecommendationPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  return (
    <div className=" bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-60% to-white pt-10 mb-40">
      <div className="md:w-1/2 pt-4 mx-auto">
        <AIStateStepComponent currentStep={currentStep} />
      </div>
      <ChatBoxContainer
        conversationId={currentConversationId}
        setConversationId={setCurrentConversationId}
        currentState={currentStep}
        setToNextState={setCurrentStep}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}
