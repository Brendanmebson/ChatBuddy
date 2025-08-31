import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Message } from '../../types';

const ConversationList: React.FC = () => {
  const { conversations, activeConversationId, setActiveConversation, messages, currentUser } = useChat();

  const getStatusIcon = (message: Message) => {
    if (message.senderId !== currentUser.id) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-y-auto scrollbar-thin">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
        const conversationMessages = messages[conversation.id] || [];
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        const isActive = activeConversationId === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => setActiveConversation(conversation.id)}
            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
              isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {otherParticipant?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  otherParticipant?.status === 'online' ? 'bg-green-500' :
                  otherParticipant?.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {otherParticipant?.name}
                  </p>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 flex-1 min-w-0">
                    {lastMessage && getStatusIcon(lastMessage)}
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;