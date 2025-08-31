import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  onMobileBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onMobileBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader onMobileBack={onMobileBack} />
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default ChatWindow;