import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useTyping = (conversationId: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const { sendTyping } = useSocket();

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(conversationId, true);
    }
  }, [isTyping, conversationId, sendTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendTyping(conversationId, false);
    }
  }, [isTyping, conversationId, sendTyping]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      timeout = setTimeout(() => {
        stopTyping();
      }, 2000); // Stop typing after 2 seconds of inactivity
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isTyping, stopTyping]);

  return { isTyping, startTyping, stopTyping };
};