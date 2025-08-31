import React, { useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../../contexts/ChatContext";
import TypingIndicator from "./TypingIndicator";

const MessageList: React.FC = () => {
  const { messages, activeConversationId, currentUser, typingIndicators } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, activeConversationId]);

  // Detect manual scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setAutoScroll(nearBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            No conversation selected
          </h3>
          <p className="text-gray-500 text-sm">
            Pick a chat from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  const conversationMessages = messages[activeConversationId] || [];
  const typingUsers = typingIndicators[activeConversationId] || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return (
          <span className="inline-flex items-center" aria-label="Sending">
            <Clock className="w-3 h-3 text-gray-400" />
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center" aria-label="Sent">
            <Check className="w-3 h-3 text-gray-400" />
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center" aria-label="Delivered">
            <CheckCheck className="w-3 h-3 text-gray-400" />
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center" aria-label="Read">
            <CheckCheck className="w-3 h-3 text-blue-500" />
          </span>
        );
      default:
        return null;
    }
  };

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Yesterday ${format(date, "HH:mm")}`;
    return format(date, "MMM dd, HH:mm");
  };

  const groupMessagesByDate = (messages: typeof conversationMessages) => {
    const groups: { [key: string]: typeof conversationMessages } = {};
    messages.forEach((message) => {
      const dateKey = format(message.timestamp, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(conversationMessages);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-gray-50 to-gray-100"
    >
      <div className="px-6 py-4">
        {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
          <div key={dateKey}>
            {/* Date separator */}
            <div className="flex justify-center sticky top-2 z-10">
              <span className="bg-gray-200/70 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                {formatDateHeader(dateKey)}
              </span>
            </div>

            {/* Messages */}
            <AnimatePresence>
              {dayMessages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser.id;
                const prevSender = dayMessages[index - 1]?.senderId;
                const nextSender = dayMessages[index + 1]?.senderId;

                const isFirstOfBlock = prevSender !== message.senderId;
                const isLastOfBlock = nextSender !== message.senderId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex mb-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isCurrentUser && (
                      <div className="w-8 mr-2 flex-shrink-0">
                        {isFirstOfBlock && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-semibold">
                              {message.senderId.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? "mr-3" : ""}`}>
                      <div
                        className={`px-4 py-2 shadow-sm text-sm leading-relaxed ${
                          isCurrentUser
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-900"
                        } ${isFirstOfBlock ? "rounded-t-2xl" : "rounded-t-md"} ${
                          isLastOfBlock ? "rounded-b-2xl" : "rounded-b-md"
                        }`}
                      >
                        {message.content}
                      </div>

                      <div
                        className={`flex items-center mt-1 space-x-1 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-[11px] text-gray-400">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        {isCurrentUser && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="mt-3">
            <TypingIndicator users={typingUsers} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
