import React from 'react';
import Sidebar from './Sidebar';
import ChatWindow from '../Chat/ChatWindow';

const DesktopLayout: React.FC = () => {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default DesktopLayout;