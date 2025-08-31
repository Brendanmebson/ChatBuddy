import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Message, Conversation, User, TypingIndicator } from '../types';
import { useSocket } from './SocketContext';

interface ChatState {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  typingIndicators: Record<string, string[]>;
}

type ChatAction =
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: string; status: Message['status'] } }
  | { type: 'SET_TYPING'; payload: TypingIndicator }
  | { type: 'CLEAR_TYPING'; payload: { conversationId: string; userId: string } }
  | { type: 'MARK_MESSAGES_AS_READ'; payload: string };

const initialState: ChatState = {
  currentUser: {
    id: 'current-user',
    name: 'You',
    status: 'online',
  },
  conversations: [
    {
      id: 'conv-1',
      participants: [
        { id: 'user-1', name: 'Alice Johnson', status: 'online' },
        { id: 'current-user', name: 'You', status: 'online' },
      ],
      unreadCount: 2,
    },
    {
      id: 'conv-2',
      participants: [
        { id: 'user-2', name: 'Bob Smith', status: 'away' },
        { id: 'current-user', name: 'You', status: 'online' },
      ],
      unreadCount: 0,
    },
    {
      id: 'conv-3',
      participants: [
        { id: 'user-3', name: 'Charlie Brown', status: 'offline' },
        { id: 'current-user', name: 'You', status: 'online' },
      ],
      unreadCount: 1,
    },
  ],
  activeConversationId: null,
  messages: {
    'conv-1': [
      {
        id: 'msg-1',
        senderId: 'user-1',
        content: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        type: 'text',
        conversationId: 'conv-1',
      },
      {
        id: 'msg-2',
        senderId: 'current-user',
        content: 'I\'m doing great! Just working on a new project.',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read',
        type: 'text',
        conversationId: 'conv-1',
      },
      {
        id: 'msg-3',
        senderId: 'user-1',
        content: 'That sounds exciting! What kind of project?',
        timestamp: new Date(Date.now() - 1800000),
        status: 'delivered',
        type: 'text',
        conversationId: 'conv-1',
      },
    ],
    'conv-2': [
      {
        id: 'msg-4',
        senderId: 'user-2',
        content: 'Don\'t forget about our meeting tomorrow!',
        timestamp: new Date(Date.now() - 7200000),
        status: 'read',
        type: 'text',
        conversationId: 'conv-2',
      },
    ],
    'conv-3': [
      {
        id: 'msg-5',
        senderId: 'user-3',
        content: 'Thanks for the help earlier!',
        timestamp: new Date(Date.now() - 86400000),
        status: 'sent',
        type: 'text',
        conversationId: 'conv-3',
      },
    ],
  },
  typingIndicators: {},
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    
    case 'ADD_MESSAGE':
      const message = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [message.conversationId]: [
            ...(state.messages[message.conversationId] || []),
            message,
          ],
        },
        conversations: state.conversations.map(conv =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message }
            : conv
        ),
      };
    
    case 'UPDATE_MESSAGE_STATUS':
      const { messageId, status } = action.payload;
      const updatedMessages = { ...state.messages };
      
      Object.keys(updatedMessages).forEach(convId => {
        updatedMessages[convId] = updatedMessages[convId].map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        );
      });
      
      return { ...state, messages: updatedMessages };
    
    case 'SET_TYPING':
      const { conversationId, userId, isTyping } = action.payload;
      const currentTyping = state.typingIndicators[conversationId] || [];
      
      if (isTyping) {
        return {
          ...state,
          typingIndicators: {
            ...state.typingIndicators,
            [conversationId]: currentTyping.includes(userId)
              ? currentTyping
              : [...currentTyping, userId],
          },
        };
      } else {
        return {
          ...state,
          typingIndicators: {
            ...state.typingIndicators,
            [conversationId]: currentTyping.filter(id => id !== userId),
          },
        };
      }
    
    case 'MARK_MESSAGES_AS_READ':
      const convId = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === convId ? { ...conv, unreadCount: 0 } : conv
        ),
        messages: {
          ...state.messages,
          [convId]: state.messages[convId]?.map(msg =>
            msg.senderId !== state.currentUser.id ? { ...msg, status: 'read' } : msg
          ) || [],
        },
      };
    
    default:
      return state;
  }
}

interface ChatContextType extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => void;
  setActiveConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { socket, sendMessage: socketSendMessage } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('message', (message: Message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    });

    socket.on('typing', (data: TypingIndicator) => {
      dispatch({ type: 'SET_TYPING', payload: data });
    });

    socket.on('messageStatusUpdate', (data: { messageId: string; status: Message['status'] }) => {
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: data });
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('messageStatusUpdate');
    };
  }, [socket]);

  const sendMessage = (content: string) => {
    if (!state.activeConversationId) return;

    const message: Omit<Message, 'id' | 'timestamp'> = {
      senderId: state.currentUser.id,
      content,
      status: 'sending',
      type: 'text',
      conversationId: state.activeConversationId,
    };

    const fullMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: fullMessage });

    // Simulate sending to server
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_MESSAGE_STATUS', 
        payload: { messageId: fullMessage.id, status: 'sent' }
      });
    }, 500);

    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_MESSAGE_STATUS', 
        payload: { messageId: fullMessage.id, status: 'delivered' }
      });
    }, 1000);
  };

  const setActiveConversation = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
    dispatch({ type: 'MARK_MESSAGES_AS_READ', payload: id });
  };

  const value = {
    ...state,
    dispatch,
    sendMessage,
    setActiveConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};