import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, TypingIndicator, User } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real app, you'd connect to your actual WebSocket server
    const newSocket = io('ws://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (socket) {
      socket.emit('message', {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      });
    }
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', { conversationId, isTyping });
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    sendTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};