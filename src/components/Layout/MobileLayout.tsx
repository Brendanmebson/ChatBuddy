import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import Sidebar from './Sidebar';
import ChatWindow from '../Chat/ChatWindow';

const MobileLayout: React.FC = () => {
  const { activeConversationId } = useChat();
  const [showSidebar, setShowSidebar] = useState(true);

  const handleConversationSelect = () => {
    setShowSidebar(false);
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
  };

  React.useEffect(() => {
    if (activeConversationId) {
      setShowSidebar(false);
    }
  }, [activeConversationId]);

  return (
    <div className="h-screen flex md:hidden">
      {showSidebar ? (
        <div className="w-full">
          <Sidebar />
        </div>
      ) : (
        <div className="w-full">
          <ChatWindow onMobileBack={handleBackToSidebar} />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;