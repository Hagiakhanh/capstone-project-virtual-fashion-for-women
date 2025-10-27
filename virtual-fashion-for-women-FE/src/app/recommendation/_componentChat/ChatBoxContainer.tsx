"use client";
import { ChatMessageStage } from "./ChatMessageStage";
import { SelectPersonalStyle } from "./SelectPersonalStyleStep";
type chatBoxCurrentTypeState = {
  currentState: number;
  setToNextState: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setConversationId: React.Dispatch<React.SetStateAction<number | null>>;
  conversationId: number | null;
};

function ChatBoxContainer({
  currentState,
  setToNextState,
  setIsLoading,
  setConversationId,
  conversationId,
}: chatBoxCurrentTypeState) {
  switch (currentState) {
    case 0: {
      return (
        <div>
          <SelectPersonalStyle
            setConversationId={setConversationId}
            setToNextState={setToNextState}
            setIsLoading={setIsLoading}
          />
        </div>
      );
    }
    default: {
      return (
        <ChatMessageStage
          conversationID={conversationId}
          setToNextState={setToNextState}
          setIsLoading={setIsLoading}
        />
      );
    }
  }
}

export default ChatBoxContainer;
