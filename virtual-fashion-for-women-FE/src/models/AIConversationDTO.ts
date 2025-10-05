export interface AIConversationDTO {
  aiconversationId: number;
  userId: number;
  currentUserStyleJson: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string | null;
  isDeleted: boolean;
  messages: ChatMessageItem[];
  suggestedOutfits: SuggestedOutfitDTO[];
  user: UserDTO | null;
}

// Nếu có dữ liệu message
export interface ChatMessageItem {
  id?: number;
  isBot: boolean;
  message: string;
  time?: string;
  isTyping?: boolean;
}

// Nếu có dữ liệu outfit gợi ý
export interface SuggestedOutfitDTO {
  id?: number;
  title?: string;
  description?: string;
  imageUrl?: string;
}

// Nếu API trả về thông tin user kèm theo
export interface UserDTO {
  userId: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
}
