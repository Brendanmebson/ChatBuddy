export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  conversationId: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  typingUsers?: string[];
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface WebSocketEvents {
  message: Message;
  typing: TypingIndicator;
  userStatusChange: { userId: string; status: User['status'] };
  messageStatusUpdate: { messageId: string; status: Message['status'] };
}