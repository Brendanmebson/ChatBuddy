import React from 'react';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import DesktopLayout from './components/Layout/DesktopLayout';
import MobileLayout from './components/Layout/MobileLayout';

function App() {
  return (
    <SocketProvider>
      <ChatProvider>
        <div className="font-sans antialiased">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <DesktopLayout />
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            <MobileLayout />
          </div>
        </div>
      </ChatProvider>
    </SocketProvider>
  );
}

export default App;